'use server';
import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import bcrypt from 'bcrypt';
import dayjs from 'dayjs';

const ChargingFormSchema = z.object({
  id: z.string(),
  chargingStation: z.string(),
  kwValue:z.string(),
  date: z.string(),
});
export type chargingState = {
  errors?: {
    chargingStation?: string[];
    kwValue?: string[];
  };
  message?: string | null;
};
export async function chargingValue(prevState: chargingState, formData: FormData) {
  const validatedFields = ChargingValue.safeParse({
    chargingStation: formData.get('chargingStation'),
    kwValue: formData.get('kWValue'),
  });
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Bilgiler gönderilirken hata.',
    };
  }
  const { chargingStation, kwValue } = validatedFields.data;
  const date = dayjs().format('YYYY-MM-DD');
  try {
    // Kullanıcıyı veritabanına ekleme
    await sql`
      INSERT INTO charging_data (charging_station, kw_value, date)
      VALUES (${chargingStation}, ${kwValue}, ${date})
    `;
  } catch (error) {
    console.log('error nedir : ', error);

    return {
      message: 'Database Error: Failed to Create Charging Data.',
    };
  }
}

export async function signUpUser(prevState: signUpState, formData: FormData) {
  const validatedFields = SignUpUser.safeParse({
    email: formData.get('email'),
    name: formData.get('name'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Uye olurken hata.',
    };
  }
  const { email, name, password, confirmPassword } = validatedFields.data;
  const saltRounds = 10; // salt için gerekli tur sayısı
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  try {
    // Kullanıcıyı veritabanına ekleme
    await sql`
      INSERT INTO users (email, password, name)
      VALUES (${email}, ${hashedPassword}, ${name})
    `;
  } catch (error) {
    console.log('error nedir : ', error);

    return {
      message: 'Database Error: Failed to Create User.',
    };
  }
  revalidatePath('/login'); // İstediğiniz revalidatePath ve redirect çağrılarını ekleyin
  redirect('/login');
}

const UserRegistrationSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  password: z.string().min(6, {
    message: 'Password must be at least 6 characters long.',
  }),
  confirmPassword: z
    .string()
    .refine((data) => data.confirmPassword === data.password, {
      message: 'Passwords do not match.',
    }),
});

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: 'Please select a customer.',
  }),
  amount: z.coerce
    .number()
    .gt(0, { message: 'Please enter an amount greater than $0.' }),
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'Please select an invoice status.',
  }),
  date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });
const UpdateInvoice = FormSchema.omit({ id: true, date: true });
const SignUpUser = UserRegistrationSchema.omit({ id: true, date: true });
const ChargingValue = ChargingFormSchema.omit({ id: true, date: true });

export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

export type signUpState = {
  errors?: {
    name?: string[];
    email?: string[];
    password?: string[];
  };
  message?: string | null;
};
export async function createInvoice(prevState: State, formData: FormData) {
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    };
  }
  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];
  try {
    await sql`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;
  } catch (error) {
    return {
      message: 'Database Error: Failed to Create Invoice.',
    };
  }
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function updateInvoice(id: string, formData: FormData) {
  const validatedFields = UpdateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Invoice.',
    };
  }
  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;
  try {
    await sql`
        UPDATE invoices
        SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
        WHERE id = ${id}
      `;
  } catch (error) {
    return { message: 'Database Error: Failed to Update Invoice.' };
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
  // throw new Error('Failed to Delete Invoice');
  try {
    await sql`DELETE FROM invoices WHERE id = ${id}`;
    revalidatePath('/dashboard/invoices');
    return { message: 'Deleted Invoice.' };
  } catch (error) {
    return { message: 'Database Error: Failed to Delete Invoice.' };
  }
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}
