import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import {BottomNavigation, Button, FAB } from 'react-native-paper';
import { Camera, CameraType, FaceDetectionResult } from 'expo-camera';
import * as FaceDetector from 'expo-face-detector';
import * as Speech from 'expo-speech';
import * as SQLite from 'expo-sqlite';
import { FaceFeature } from 'expo-face-detector';


interface Kayttaja {
  id : number,
  tunnus : string,
  salasana : string
}

const db : SQLite.WebSQLDatabase = SQLite.openDatabase("kayttajalista.db");

db.transaction(
  (tx : SQLite.SQLTransaction) => {
    tx.executeSql(`CREATE TABLE IF NOT EXISTS kayttajat (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    tunnus TEXT,
                    salasana TEXT
                  )`);
  }, 
  (err: SQLite.SQLError) => {
    console.log(err);
  }
);

const App : React.FC = () : React.ReactElement => {

  const [index, setIndex] = React.useState(0);
  const [virhe, setVirhe] = useState<String>("");
  const [tunnus, setTunnus] = useState<string>("");
  const [salasana, setSalasana] = useState<string>("");
  const [kameratila, setKameratila] = useState<Boolean>(false);
  const [kirjauduttu, setKirjauduttu] = useState<Boolean>(false);
  const [naama, setNaama] = useState<FaceFeature[]>([]);
  const [hymyilyInfo, setHymyilyInfo] = useState<string>("Käyttäjä ei hymyile");
  const [kayttajat, setKayttajat] = useState<Kayttaja[]>([]);
  const [tervehdys, setTervehdys] = useState<string>("");
  const [aika, setAika] = useState<Date>(new Date());
  const [routes] = React.useState([
    { key: 'kamera', title: 'Hymy skanneri', focusedIcon: 'emoticon-happy-outline'},
    { key: 'kello', title: 'Kello', focusedIcon: 'clock-time-five-outline' },
  ]);

  const kameraRef : any = useRef<Camera>();

  const haeKayttajat = () : void => {
    db.transaction(
      (tx : SQLite.SQLTransaction) => {
        tx.executeSql(`SELECT * FROM kayttajat`, [], 
        (_tx : SQLite.SQLTransaction, rs : SQLite.SQLResultSet) => {
          setKayttajat(rs.rows._array);
        });
      }, 
      (err: SQLite.SQLError) => console.log(err)
    );
  }

  /*const tyhjennaKayttajalista = () : void => {
    db.transaction(
        (tx : SQLite.SQLTransaction) => {
          tx.executeSql(`DELETE FROM kayttajat`, [], 
          (_tx : SQLite.SQLTransaction, rs : SQLite.SQLResultSet) => {
            haeKayttajat();
          });
        }, 
        (err: SQLite.SQLError) => console.log(err), 
        () => console.log("Lista tyhjennetty")  
     );
  }*/

  const kirjaudu = () : void => { //kirjautuminen

    paivitaAika(); 

    if(tunnus && salasana) { //tarkistaa onko tunnus ja ss annettu, tarkistaa sitten onko jo olemassa
      if(isFound){
        const tiedot = kayttajat.find((kayttaja : any) => kayttaja.tunnus === tunnus);
        if(tiedot?.salasana === salasana){ //tarkastaa onko olemassa olevan käyttäjän ss oikein
          setVirhe("");
          tarkistaAika();
          setKirjauduttu(true);
          Puhu();

        } else { setVirhe("Väärä salasana"); }

      } else {
        setVirhe("");
        db.transaction(
          (tx : SQLite.SQLTransaction) => {
            tx.executeSql(`INSERT INTO kayttajat (tunnus, salasana) VALUES (?, ?) `, [tunnus, salasana], 
            (_tx : SQLite.SQLTransaction, rs : SQLite.SQLResultSet) => {});
          }, 
          (err: SQLite.SQLError) => console.log(err), 
          () => console.log(`Kayttaja ${tunnus} lisätty!`));
          
        tarkistaAika();
        setKirjauduttu(true);
        Puhu();
      }

    } else {
      setVirhe("Tunnus tai salasana puuttuu");
    }
  };

  const isFound = kayttajat.some(element => { //tarkistaa onko käyttäjä olemassa
    if (element.tunnus === tunnus) { return true;
    } else { return false; }
  });

  const tarkistaAika = () => {

      if (aika?.getHours() <= 5){ setTervehdys("Hyvää yötä ");

      }else if(aika?.getHours() <= 12){ setTervehdys("Hyvää huomenta ");

      } else if(aika?.getHours() <= 18){ setTervehdys("Hyvää iltapäivää ")

      } else if(aika?.getHours() <= 22){ setTervehdys("Hyvää iltaa ")

      } else if(aika?.getHours() <= 24){ setTervehdys("Hyvää yötä ") 
    
      } else {setTervehdys("")}
  };

  const paivitaAika = () => { //päivittää ajan
      setAika(new Date());
  }

  function addZero(i : any) { //lisää nollat kelloon, jos numerot on yksinumeroisia
    if (i < 10) {i = "0" + i}
    return i;
  }

  const kaynnistaKamera = async () : Promise<void> => {  //QR-koodin aloitus

    const {status} = await Camera.requestCameraPermissionsAsync();

    if (status === "granted") {
      setVirhe("");
      setKameratila(true);

    } else {
      setVirhe("Ei sallittu");
    }
  };

  const options = {
    SpeechOptions : {
      pitch : 0.1,  //ei toimi suomenkielisessä äänessä
      //language : "en"
    }
  }

  const Puhu = () => {
    Speech.speak(`${tervehdys} ${tunnus}`, options.SpeechOptions);
  };

  const handleFacesDetected = (faces : FaceDetectionResult) => {
    setNaama(faces.faces);
    const tiedot2 = naama.find((naama : any) => naama.smilingProbability);

    if (tiedot2?.smilingProbability) {
      if (tiedot2.smilingProbability > 0.7) {
        setHymyilyInfo("Käyttäjä hymyilee");

      } else {
        setHymyilyInfo("Käyttäjä ei hymyile");
      }
    }
  };

  const kameraRoute = () => 
    <>
      <Button onPress={() => setKirjauduttu(false)} >Kirjaudu ulos</Button>

      <Button
      style={styles.nappi}
      icon="qrcode" 
      mode="contained" 
      onPress={kaynnistaKamera}
      >Skannaa hymy</Button>
    </>;

  const kelloRoute = () => 
  <>
    <Text style={styles.kello}>{addZero(aika.getHours()) + ":" + addZero(aika.getMinutes()) + ":" + addZero(aika.getSeconds())}</Text>

  </>;

  const renderScene = BottomNavigation.SceneMap({
    kamera: kameraRoute,
    kello: kelloRoute,
  });

  const onChangeText = (inputRef: React.SetStateAction<string>) => setTunnus(inputRef);
  const onChangeText2 = (inputRef: React.SetStateAction<string>) => setSalasana(inputRef);

  useEffect(() => {
    haeKayttajat();
    setInterval(paivitaAika, 1000); //päivittää kellon sekunnin välein
    console.log(kayttajat);
  }, []);

  return (
    (kirjauduttu)
    ? (kameratila)
        ? <Camera
            type={CameraType.front}
            ref={kameraRef}
            style={styles.kameranakyma}
            onFacesDetected={handleFacesDetected}
            faceDetectorSettings={{
              mode: FaceDetector.FaceDetectorMode.accurate,
              detectLandmarks: FaceDetector.FaceDetectorLandmarks.none,
              runClassifications: FaceDetector.FaceDetectorClassifications.all,
              minDetectionInterval: 2000,
              tracking: true,
            }}
          >

            <Text style={styles.virhe}>{hymyilyInfo}</Text>

            <FAB
              style={styles.nappiSulje}
              icon="close"
              label='Sulje'
              onPress={() => setKameratila(false)}
            />
          </Camera>

        : <>
            <Text style={styles.virhe}>{virhe}</Text>

            <BottomNavigation
              navigationState={{ index, routes }}
              onIndexChange={setIndex}
              renderScene={renderScene}
            />
            <StatusBar style="auto"/>
          </>

    : <>
        <Text style={styles.virhe}>{virhe}</Text>
        
        <TextInput
        style={styles.input}
        onChangeText={onChangeText}
        value={tunnus}
        placeholder="Tunnus..."
        />
        <TextInput
        style={styles.input}
        onChangeText={onChangeText2}
        value={salasana}
        placeholder="Salasana..."
        />
        <Button mode="contained" onPress={kirjaudu}>Kirjaudu</Button>
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
  cameraContainer: {
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
  nappiSulje: {
    position : 'absolute',
    margin : 20,
    bottom : 0,
    right :0    
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
  virhe : {
    marginTop: 20,
    padding: 20,
    color: "red"
  },
  kello : {
    fontSize: 40,
    marginLeft: 90
  }
});

export default App;