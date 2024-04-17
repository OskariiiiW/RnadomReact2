import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import CheckBoxOutlineBlank from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBox from '@mui/icons-material/CheckBox';
import DeleteIcon from '@mui/icons-material/Delete';
import { Button, Container, IconButton, List, ListItem, ListItemIcon, ListItemText, Typography } from '@mui/material';
import { AppDispatch, RootState } from '../redux/store';
import { haeHeitot, tallennaHeitot, Heitto, vaihdaSuoritettu } from '../redux/heittolistaSlice';
import PoistaTehtava from './PoistaHeitto';

interface Props {
    kierrosApu : {
        heitto : Heitto,
        auki : boolean
    }
}

const Kierrokset : React.FC<Props> = (props : Props) : React.ReactElement => {

    const [kierros, setKierros] = useState<number>(1);

    const heitot = useSelector((state : RootState) => state.heittolista.heitot);
    const dispatch : AppDispatch = useDispatch();

    const seuraavaKierros = () => {

        if(kierros == 4) { //undefined props.kierrosApu.heitto.kierrokset
            console.log(props.kierrosApu.heitto.nimi);

        } else {
            setKierros(kierros + 1); 
            console.log("joojojojojo"); 
        }
    }

  return (
    <>
    {heitot.map((heitto : Heitto, idx : number) => {
        return (
        <Container key={idx}>
            <Typography variant="h4">Kierros {kierros}/{heitto.kierrokset}</Typography> 
            <ListItem>
                <ListItemText primary={"Kilpailija 1: " + heitto.kilpailijat[0]} />
                <ListItemText primary={"Kilpailija 2: " + heitto.kilpailijat[1]} />
            </ListItem>
            <Button variant="contained" onClick={seuraavaKierros}>Seuraava kierros</Button>
        </Container>)
      })}
    </>
  )
}

export default Kierrokset;