import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, ListItem, ListItemText, MenuItem, Select, TextField, Typography } from '@mui/material';
import React, { useRef, useState } from 'react';
import {useDispatch} from 'react-redux';
import { AppDispatch } from '../redux/store';
import { lisaaHeitto, tallennaHeitot, Heitto } from '../redux/heittolistaSlice';
import { v4 as uuidv4 } from 'uuid';

interface Props {
  auki : boolean,
  setLisays : (arg0: boolean) => void,
  setAuki : (arg0: boolean) => void,
  setKierrosApu : (arg0 : any) => void,
  kierrosApu : {
    heitto : Heitto,
    auki : boolean
  }
  //setKierrosKaynnissa : (arg0: boolean) => void
}

const LisaaHeitto : React.FC<Props> = (props : Props) : React.ReactElement => {
  
  const nimiRef : React.MutableRefObject<any> = useRef<HTMLInputElement>();
  const kilpailijaRef : React.MutableRefObject<any> = useRef<HTMLInputElement>();
  const dispatch : AppDispatch = useDispatch();
  const [kilpailijat, setKilpailijat] = useState<string[]>([]);
  //const [pisteet, setPisteet] = useState<number[]>([]);
  const [kierrokset, setKierrokset] = useState<number>(0);
  const [virhe, setVirhe] = useState<string>("");

  const kasitteleLisays = () : void => {

    if(!nimiRef.current.value){

      setVirhe("Anna tapahtumalle nimi");

    } else if (kierrokset > 0){ //erittain sekava tapa kasitella kaikki toiminta saman funktion sisalla :D

      let uusiHeitto : Heitto = {
        id : uuidv4(),
        nimi : nimiRef.current.value,
        ajankohta : new Date().toUTCString(),
        kilpailijat : kilpailijat,
        kierrokset : kierrokset,
        pisteet : [],
        suoritettu : false
      } 
      setVirhe("");
      props.setAuki(false);
      dispatch(lisaaHeitto(uusiHeitto));
      dispatch(tallennaHeitot());
      props.setKierrosApu({auki : true});
      props.setLisays(false);
      
    } else {

      props.setAuki(true);
      console.log("täällä ollaan2");

    }
  }

  const uusiPelaaja = () : void => {

    if(!kilpailijaRef.current.value){

      setVirhe("Kilpailijan nimi ei saa olla tyhjä")

    } else {
      setKilpailijat([...kilpailijat, kilpailijaRef.current.value]);
      setVirhe("");
    }
  }

  const handleChange = (e : any) => { //oikea arvo tulee muutoksen myohassa, kai????
    setKierrokset(e.target.value);
  };

  const peruuta = () => { //ei olisi tarvinnut, jos tietaisin, miten toteuttaa 2 funktiota onClickissa 
    props.setAuki(false);
    setKierrokset(0);
  }

  return (
    <>
    <Typography variant="h6" sx={{marginTop: "10px"}}>Uuden kilpailun lisäys</Typography>
    <Typography variant="h6" sx={{marginTop: "10px", color : "red"}}>{virhe}</Typography>

    <TextField id="outlined-basic" label="Tapahtuman nimi..." variant="outlined" inputRef={nimiRef} />
    <TextField id="outlined-basic" label="Kilpailijan nimi..." variant="outlined" inputRef={kilpailijaRef} />

    <Button variant="outlined" onClick={uusiPelaaja}>Lisää kilpailija</Button>

    <Button variant="outlined" onClick={() => setKilpailijat([])}>Tyhjennä pelaajat</Button>

    {(kilpailijat.length > 1)
    ? <Button variant="contained" onClick={kasitteleLisays}>Aloita kilpailu</Button>
    : <></>
    }

    {kilpailijat.map((kilpailijat : string, idx : number) => {
        return (<ListItem
                    key={idx}
                  >
                  <ListItemText 
                    primary={"Pelaaja " + (idx + 1) + " : " + kilpailijat}
                  />
                </ListItem>)
    })}

    <Dialog
        open={props.auki}
        onClose={() => props.setAuki(false)}
        fullWidth={true}
      >
      <DialogTitle>
        Kierrosten määrä
      </DialogTitle>
      
        <DialogContent>
          <FormControl fullWidth>
          <Select
              defaultValue={1}
              label="Kierrosten määrä"
              onChange={handleChange}
          >
              <MenuItem value={1}>1</MenuItem>
              <MenuItem value={2}>2</MenuItem>
              <MenuItem value={3}>3</MenuItem>
              <MenuItem value={4}>4</MenuItem>
              <MenuItem value={5}>5</MenuItem>
              <MenuItem value={6}>6</MenuItem>
              <MenuItem value={7}>7</MenuItem>
              <MenuItem value={8}>8</MenuItem>
              <MenuItem value={9}>9</MenuItem>
              <MenuItem value={10}>10</MenuItem>
          </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={kasitteleLisays}>Aloita kierros 1</Button>
          <Button onClick={peruuta}>Peruuta</Button>
        </DialogActions>
      
    </Dialog>
    
    </>
  )
}

export default LisaaHeitto;