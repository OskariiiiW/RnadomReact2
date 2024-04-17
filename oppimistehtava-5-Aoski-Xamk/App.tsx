import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { Appbar, Dialog, Button, FAB, IconButton, List, TextInput, Portal, Provider, Title } from 'react-native-paper';
import * as SQLite from 'expo-sqlite';
import * as Location from 'expo-location';
import { LocationObject } from 'expo-location';

interface DialogiData {
  auki : boolean,
  tunnisteData : string,
  ohjeistusData : string
}

interface PoistoDialogi {
  auki : boolean,
  id : number
}

interface Sijainti {
  id : number,
  tunnisteteksti : string,
  ohjeistusteksti : string,
  sijaintiLat : number,
  sijaintiLon : number,
  aika : Date,
  poimittu : number
}

const db : SQLite.WebSQLDatabase = SQLite.openDatabase("sijantilista.db");

db.transaction(
  (tx : SQLite.SQLTransaction) => {
    tx.executeSql(`CREATE TABLE IF NOT EXISTS sijainnit (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    tunnisteteksti TEXT,
                    ohjeistusteksti TEXT,
                    sijaintiLat FLOAT,
                    sijaintiLon FLOAT,
                    aika DATETIME,
                    poimittu INTEGER
                  )`);
  }, 
  (err: SQLite.SQLError) => {
    console.log(err);
  }
);

export default function App() {

  const [sijainnit, setSijainnit] = useState<Sijainti[]>([]);
  const [sijainti, setSijainti] = useState<LocationObject>();
  const [virhe, setVirhe] = useState<String>("");
  const [dialogi, setDialogi] = useState<DialogiData>({
    auki : false,
    tunnisteData : "",
    ohjeistusData : ""
  });
  const [poistoDialogi, setPoistoDialogi] = useState<PoistoDialogi>({
    auki : false,
    id : -1        //varmuuden vuoksi miinuksen puolella
  });

  const lisaaSijainti = async () : Promise<void> => {  //------------------------------------LISAYS------------------------------------

    const {status} = await Location.requestForegroundPermissionsAsync();

    if (status === "granted") {

      setSijainti(await Location.getCurrentPositionAsync({}));
      let aikaNyky = new Date();
      setVirhe("");
      console.log(aikaNyky);

      db.transaction(
        (tx : SQLite.SQLTransaction) => { //valilla sijainti ei tule
          tx.executeSql(`INSERT INTO sijainnit (tunnisteteksti, ohjeistusteksti, sijaintiLat, sijaintiLon, aika, poimittu) VALUES (?, ?, ?, ?, ?, ?) `,
            [dialogi.tunnisteData, dialogi.ohjeistusData, sijainti?.coords.latitude.toFixed(2) || "virhe",
              sijainti?.coords.longitude.toFixed(2) || "virhe", aikaNyky.toString(), 0], 
            (_tx : SQLite.SQLTransaction, rs : SQLite.SQLResultSet) => {
              haeSijainnit();
            });
        }, 
        (err: SQLite.SQLError) => console.log(err)
      );  

    } else {
      setVirhe("Sijainti ei ole sallittu laitteessa");
    }
    setDialogi({auki : false, tunnisteData : "", ohjeistusData : ""});
  };

  const haeSijainnit = () : void => {

    db.transaction(
      (tx : SQLite.SQLTransaction) => {
        tx.executeSql(`SELECT * FROM sijainnit`, [], 
        (_tx : SQLite.SQLTransaction, rs : SQLite.SQLResultSet) => {
          setSijainnit(rs.rows._array);
        });
      }, 
      (err: SQLite.SQLError) => console.log(err)
    );
    console.log(sijainnit);
  };

  const poistaMerkinta = (id : number) : void => {  //----------------------POISTO-------------------------

    db.transaction(
        (tx : SQLite.SQLTransaction) => {
          tx.executeSql(`DELETE FROM sijainnit WHERE id = ?`, [id], 
          (_tx : SQLite.SQLTransaction, rs : SQLite.SQLResultSet) => {
            haeSijainnit();
          });
        }, 
        (err: SQLite.SQLError) => console.log(err)
     );
    setPoistoDialogi({auki : false, id : -1});
  };

  useEffect(() => {

    haeSijainnit();
  }, []);

  return (
    <Provider>
      <Appbar.Header>
        <Appbar.Content title="Sijaintimuistio"/>
      </Appbar.Header>
      <ScrollView style={{ padding : 20 }}>
        
        <Title>Sijaintilista</Title>

        <Text>{virhe}</Text>

        { (sijainnit.length > 0)
        ? sijainnit.map((sijainti: Sijainti, idx : number) => <List.Item
            title={sijainti.tunnisteteksti}
            description={"Lisätietoja : " + sijainti.ohjeistusteksti + ", Latitude : " + sijainti.sijaintiLat + 
              ", Longitude : " + sijainti.sijaintiLon + ", Päiväys : " + sijainti.aika}
            descriptionNumberOfLines={5}
            key={idx} 
            left={() => <IconButton 
              icon={"delete"}
              onPress={() => { setPoistoDialogi({auki : true, id : sijainti.id})}} 
            />}
          />)
          
        : <Text>Ei sijainteja</Text>      
        }

        <FAB
          style={styles.container}
          icon="map-marker-plus-outline"
          label='Lisää uusi'
          onPress={() => setDialogi({auki: true, tunnisteData : "", ohjeistusData : ""})}
        />

        <Portal>
          <Dialog 
            visible={dialogi.auki}
            onDismiss={() => setDialogi({auki : false, tunnisteData : "", ohjeistusData : ""})} 
          >
            <Dialog.Title>Lisää uusi sijainti</Dialog.Title>
            <Dialog.Content>
              <TextInput
                label="Nimi"
                mode="outlined"
                placeholder='Anna sijainnille nimi...'
                onChangeText={ (tunniste : string) => setDialogi({ ...dialogi, tunnisteData : tunniste}) }
              />
              <TextInput
                label="Lisäohjeistus"
                mode="outlined"
                placeholder='Anna sijainnille lisäohjeistuksia...'
                onChangeText={ (ohjeistus : string) => setDialogi({ ...dialogi, ohjeistusData : ohjeistus}) }
              />
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={lisaaSijainti}>Lisää listaan</Button>
              <Button onPress={() => setDialogi({auki : false, tunnisteData : "", ohjeistusData : ""})}>Peruuta</Button>
            </Dialog.Actions>
          </Dialog>

          <Dialog 
            visible={poistoDialogi.auki}
            onDismiss={() => setPoistoDialogi({auki:false, id : -1})}
          >
            <Dialog.Title>Haluatko varmasti poistaa sijaintimerkinnän?</Dialog.Title>
            <Dialog.Actions>
              <Button onPress={() => poistaMerkinta(poistoDialogi.id)} buttonColor="red">Poista</Button>
              <Button onPress={() => setPoistoDialogi({auki : false, id : -1})}>Peruuta</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>

      </ScrollView>
      <StatusBar style="auto" />
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});