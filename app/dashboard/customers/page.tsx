'use client';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import { chargingValue } from '../../lib/action';
import { useFormState } from 'react-dom';
import Button from '@mui/material/Button';
import dayjs from 'dayjs';
import { fetchChargingData } from '@/app/lib/data';

export default  function Page() {
  const [errorMessage, dispatch] = useFormState(chargingValue, undefined);
  console.log('error charging :  ', errorMessage);
  const [chargingStation, setChargingStation] = useState('');
  const handleChange = (event: SelectChangeEvent) => {
    setChargingStation(event.target.value as string);
  };
  
  // useEffect(() => {
  //   fetch('@/app/lib/data/fetchChargingData')
  //     .then((res) => res.json())
  //     .then((data) => {
  //       setData(data);
  //       setLoading(false);
  //     });
  // }, []);
  

  // const chargingData = await fetchChargingData();
  //  if (!chargingData) return <p>No profile data</p>;
  // console.log('data geliyor mu: ', chargingData);
  return (
    <form action={dispatch}>
      <Box>
        <Grid container item spacing={2} xs={12}>
          <Grid item container xs={6} spacing={2} direction={'row'}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">
                  Araç Şarj İstasyonu
                </InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={chargingStation}
                  name="chargingStation"
                  onChange={handleChange}
                >
                  <MenuItem value={10}>Şarj istasyonu1</MenuItem>
                  <MenuItem value={20}>Şarj istasyonu2</MenuItem>
                  <MenuItem value={30}>Şarj istasyonu3</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="kWValue"
                fullWidth
                id="outlined-basic"
                label="Outlined"
                variant="outlined"
              />
            </Grid>

            <Grid item xs={4}>
              <Button type="submit" variant="contained">
                Kaydet
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </form>
  );
}
