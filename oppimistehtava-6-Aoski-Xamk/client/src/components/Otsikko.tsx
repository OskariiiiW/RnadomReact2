import { Typography } from '@mui/material';
import React from 'react'

const Otsikko : React.FC = () : React.ReactElement => {
  return (
    <>

        <Typography variant="h5">Oppimistehtävä 6</Typography>
        <Typography variant="h6" sx={{marginTop: "10px"}}>Tikanheiton tulokset</Typography>

    </>
  )
}

export default Otsikko;