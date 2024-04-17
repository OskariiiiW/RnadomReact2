import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import CheckBoxOutlineBlank from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBox from '@mui/icons-material/CheckBox';
import DeleteIcon from '@mui/icons-material/Delete';
import { IconButton, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { AppDispatch, RootState } from '../redux/store';
import { haeHeitot, tallennaHeitot, Heitto, vaihdaSuoritettu } from '../redux/heittolistaSlice';
import PoistaTehtava from './PoistaHeitto';
import Kierrokset from './Kierrokset';

const Heittolista : React.FC = () : React.ReactElement => {

  const haettu : React.MutableRefObject<boolean> = useRef<boolean>(false);
  const [poistoDialogi, setPoistoDialogi] = useState<any>({
    heitto : {},
    auki : false
  });

  const heitot = useSelector((state : RootState) => state.heittolista.heitot);

  const dispatch : AppDispatch = useDispatch();

  useEffect(() => {

    if (!haettu.current) {

      dispatch(haeHeitot());
    }

    return () => { haettu.current = true }

  }, [dispatch]);

  return (
    <>
    <List>
      {heitot.map((heitto : Heitto, idx : number) => {
        return (<ListItem
                    key={idx}
                    secondaryAction={<IconButton
                                        onClick={() => setPoistoDialogi({heitto : heitto, auki : true})}
                                      >
                                        <DeleteIcon />
                                      </IconButton>}
                  >
                  <ListItemIcon>
                  <IconButton
                    onClick={() => {
                      dispatch(vaihdaSuoritettu(heitto.id));
                      dispatch(tallennaHeitot());
                    }}
                  >
                    {(heitto.suoritettu) ? <CheckBox/> : <CheckBoxOutlineBlank/>}
                  </IconButton>
                  </ListItemIcon>
                  <ListItemText 
                    primary={heitto.nimi}
                    secondary={heitto.ajankohta}
                  />
                </ListItem>)
      })}
    </List>
    <PoistaTehtava poistoDialogi={poistoDialogi} setPoistoDialogi={setPoistoDialogi}/>
    </>
  )
}

export default Heittolista;