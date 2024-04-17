import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {BottomNavigation, Button } from 'react-native-paper';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { LocationObject } from 'expo-location';

const App : React.FC = () : React.ReactElement => {

  const [index, setIndex] = React.useState(0);
  const [virhe, setVirhe] = useState<String>("");
  const [skannaustila, setSkannaustila] = useState<Boolean>(false);
  //const [sijaintitila, setSijaintitila] = useState<Boolean>(false);
  const [skannattu, setSkannattu] = useState<Boolean>(false);
  const [toimivaOsoite, setToimivaOsoite] = useState<Boolean>(false);
  const [osoite, setOsoite] = useState<string>("");
  const [sijainti, setSijainti] = useState<LocationObject>();
  const [routes] = React.useState([
    { key: 'skanneri', title: 'QR-skanneri', focusedIcon: 'qrcode'},
    { key: 'otto', title: 'Lähin automaatti', focusedIcon: 'currency-eur' },
  ]);

  const kaynnistaSkanneri = async () : Promise<void> => {  //QR-koodin aloitus

    const {status} = await BarCodeScanner.requestPermissionsAsync();

    if (status === "granted") {
      setVirhe("");
      setSkannaustila(true);

    } else {
      setVirhe("Ei sallittu");
    }
  };

  const kaynnistaSijainti = async () : Promise<void> => {  //Otto-automaatin etsinnan aloitus

    const {status} = await Location.requestForegroundPermissionsAsync();

    if (status === "granted") {
      setVirhe("");
      let sijaintiNyky = await Location.getCurrentPositionAsync({});
      setSijainti(sijaintiNyky);

      //console.log(sijainti?.coords.altitude); //maa littea tassa tehtavassa
      console.log(sijainti?.coords.latitude);
      console.log(sijainti?.coords.longitude);

      const tiedot = fetch('./automaatit.json');

      console.log(tiedot);

      const R = 6371e3; //kyseenalainen kaava
      const a = Number(sijainti?.coords.latitude) * Math.PI/180;
      const b = Number(sijainti?.coords.latitude) * Math.PI/180;

    } else {
      setVirhe("Ei sallittu");
    }
  };

  const etsiSkannaus = () => {  //osoitteen tarkistus ja sinne ohjaaminen

    if (osoite.startsWith("https://")) {
      setVirhe("");
      setToimivaOsoite(true);

    } else if (osoite.startsWith("http://")) { // || laittaminen ekaan if lauseeseen ei toiminut
      setVirhe("");
      setToimivaOsoite(true);

    } else {
      setVirhe("QR-koodin osoite oli virheellinen");
    }
    setSkannattu(false);
  };

  const takaisin = () => {
    setToimivaOsoite(false);
  }

  const Skannaa = (data: any) : void => {

    setSkannattu(true);
    setOsoite(data.data);
    //console.log(` data: ${data.data}`);
    setSkannaustila(false);
    etsiSkannaus();
  };

  const skanneriRoute = () => 
    <Button
    style={styles.nappi}
    icon="qrcode" 
    mode="contained" 
    onPress={kaynnistaSkanneri}
    >Skannaa koodi</Button>;

  const ottoRoute = () => 
    <Button
    style={styles.nappi}
    icon="map-marker" 
    mode="contained" 
    onPress={kaynnistaSijainti}
    >Etsi lähin otto-automaatti</Button>;

  const renderScene = BottomNavigation.SceneMap({
    skanneri: skanneriRoute,
    otto: ottoRoute,
  });

  return (
    (skannaustila)
    ? <BarCodeScanner style={styles.kameranakyma}
        onBarCodeScanned={skannattu ? undefined : Skannaa}
    />

    : (toimivaOsoite) 
      ? <><WebView 
          style={styles.container}
          source={{ uri: osoite }}
      /><Button onPress={takaisin}>Takaisin</Button></>
    
      :<>
        <Text style={styles.virhe}>{virhe}</Text>

        <BottomNavigation
          navigationState={{ index, routes }}
          onIndexChange={setIndex}
          renderScene={renderScene}
        />

        <StatusBar style="auto"/>
      </>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kameranakyma : {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nappi : {
    margin: 20,
    bottom: 0,
    left: 0,
    marginTop: 250
  },
  virhe : {
    padding: 20
  }
});

export default App;