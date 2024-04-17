import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button } from '@mui/material';
import React from 'react'
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../redux/store';
import { poistaHeitto, tallennaHeitot, Heitto } from '../redux/heittolistaSlice';

interface Props {
  poistoDialogi : {
    heitto : Heitto,
    auki : boolean
  },
  setPoistoDialogi : (arg0 : any) => void
}

const PoistaTehtava : React.FC<Props> = (props : Props) : React.ReactElement => {

  const dispatch : AppDispatch = useDispatch();

  const kasittelePoisto = () => {

    dispatch(poistaHeitto(props.poistoDialogi.heitto.id));
    dispatch(tallennaHeitot());
    
    props.setPoistoDialogi({...props.poistoDialogi, auki : false});
  }

  return (
    <Dialog
    open={props.poistoDialogi.auki}
    onClose={() => props.setPoistoDialogi({...props.poistoDialogi, auki : false})}
    fullWidth={true}
    >
    <DialogTitle>
      Poista tehtävä
    </DialogTitle>
    <DialogContent>
      Haluatko varmasti poistaa tehtävän: "{props.poistoDialogi.heitto.nimi}"?
    </DialogContent>
    <DialogActions>
      <Button onClick={kasittelePoisto}>Poista</Button>
      <Button onClick={() => props.setPoistoDialogi({...props.poistoDialogi, auki : false})}>Peruuta</Button>
    </DialogActions>
  </Dialog>
  )
}

export default PoistaTehtava;