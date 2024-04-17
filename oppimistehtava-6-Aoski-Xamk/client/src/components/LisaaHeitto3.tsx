import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import React, { useRef } from 'react';
import {useDispatch} from 'react-redux';
import { AppDispatch } from '../redux/store';
import { lisaaHeitto, tallennaHeitot, Heitto } from '../redux/heittolistaSlice';
import { v4 as uuidv4 } from 'uuid';

interface Props {
  auki : boolean,
  setAuki : (arg0: boolean) => void
}

const LisaaHeitto3 : React.FC<Props> = (props : Props) : React.ReactElement => {
  
  const nimiRef : React.MutableRefObject<any> = useRef<HTMLInputElement>();
  const dispatch : AppDispatch = useDispatch();

  const kasitteleLisays = () : void => {

    let uusiHeitto : Heitto = {
      id : uuidv4(),
      nimi : nimiRef.current.value || "(nimetön kilpailu)",
      ajankohta : new Date().toUTCString(),
      kilpailijat : ["aama", "asdas"],
      kierrokset : 1,
      pisteet : [1, 2],
      suoritettu : false
    } 

    dispatch(lisaaHeitto(uusiHeitto));
    dispatch(tallennaHeitot());

    props.setAuki(false);
  }

  return (
    <Dialog
        open={props.auki}
        onClose={() => props.setAuki(false)}
        fullWidth={true}
      >
      <DialogTitle>
        Lisää uusi kilpailu
      </DialogTitle>
      <DialogContent>
        <TextField
          inputRef={nimiRef} 
          variant='outlined'
          label="Kilpailun nimi"
          fullWidth={true}
          sx={{marginTop : "10px"}}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={kasitteleLisays}>Lisää</Button>
        <Button onClick={() => props.setAuki(false)}>Peruuta</Button>
      </DialogActions>
    </Dialog>
  )
}

export default LisaaHeitto3;