import React, { useState } from 'react';
import {Routes, Route} from 'react-router-dom';
import { Button, Container, Stack } from '@mui/material';
import Otsikko from './components/Otsikko';
import Heittolista from './components/Heittolista';
import LisaaHeitto from './components/LisaaHeitto';
import Kierrokset from './components/Kierrokset';

function App() {

  const [lisaysDialogi, setLisaysDialogi] = useState<boolean>(false);
  const [lisays, setLisays] = useState<boolean>(false);
  const [kierrosApu, setKierrosApu] = useState<any>({
    heitto : {},
    auki : false
  });

  return (
    <Container>
      <Stack spacing={2}>

    {(!lisays)
      ? (kierrosApu.auki)
          ? <Kierrokset kierrosApu={kierrosApu}/>

          :<>
            <Otsikko/>
            <Heittolista />
            <Button 
              variant="contained"
              onClick={() => setLisays(true)}
            >Lisää uusi kilpailu</Button>
          </>

      : <LisaaHeitto auki={lisaysDialogi} setAuki={setLisaysDialogi} setLisays={setLisays} kierrosApu={kierrosApu} setKierrosApu={setKierrosApu}/>
    }

      </Stack>
    </Container>
  );
}

export default App;