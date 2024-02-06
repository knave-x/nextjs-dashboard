import '@/app/ui/global.css';
import { inter } from '@/app/ui/fonts';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../app/theme';
export default function RootLayout(props: any) {
  return (
    <html lang="en">
      <body>
        <AppRouterCacheProvider>
        <ThemeProvider theme={theme}>
          {props.children}
          </ThemeProvider>
          </AppRouterCacheProvider>
      </body>
    </html>
  );
}
