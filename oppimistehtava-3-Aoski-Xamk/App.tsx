import { StatusBar } from 'expo-status-bar';
import React, { useRef, useState } from 'react';
import { StyleSheet, Image, Text, View, TextInput } from 'react-native';
import {Appbar, Button, Dialog, FAB, IconButton } from 'react-native-paper';
import {Camera, CameraCapturedPicture} from 'expo-camera';

const App : React.FC = () : React.ReactElement => {

  const [kuvaustila, setKuvaustila] = useState<Boolean>(false);
  const [kuvaOtettu, setKuvaOtettu] = useState<Boolean>(false);
  const [visible, setVisible] = React.useState(false);
  const [kuvaustilaInfo, setKuvaustilaInfo] = useState<String>("");
  const [kuvaTeksti, setKuvaTeksti] = useState<string>(''); // textInput value valitti, että String ei sovi stringille
  const [valiaikainenTeksti, setValiaikainenTeksti] = useState<string>(''); //estaa tekstin muuttumisen, jos peruuttaa nimeamisen ja kuvan oton
  const [virhe, setVirhe] = useState<String>("");
  const [kuva, setKuva] = useState<CameraCapturedPicture>(); //estaa kuvan muuttumisen, jos peruuttaa nimeamisen ja kuvan oton
  const [valiaikainenKuva, setValiaikainenKuva] = useState<CameraCapturedPicture>();

  const kameraRef : any = useRef<Camera>();

  const kaynnistaKamera = async () : Promise<void> => {

    const {status} = await Camera.requestCameraPermissionsAsync();

    if (status === "granted") {
      setVirhe("");
      setKuvaustila(true);

    } else {
      setVirhe("ei sallittu");
    }
  };

  const otaKuva = async () : Promise<void> => {

    setKuvaustilaInfo("Tallennetaan kuvaa...");

      if (kameraRef) {
        const apukuva : CameraCapturedPicture = await kameraRef.current.takePictureAsync();

        setKuvaOtettu(true);
        setVisible(true);
        setValiaikainenKuva(apukuva);
        
      }
      setKuvaustila(false);
      setKuvaustilaInfo("");
    };

  const peruuta = () => { 
    setVisible(false); 
    setKuvaustila(true); 
    setKuvaOtettu(false); };

  const eteenpain = () => { 
    setVisible(false); 
    setKuvaustila(false); 
    setKuvaOtettu(false);
    setKuva(valiaikainenKuva);
    setKuvaTeksti(valiaikainenTeksti); };

  const onChangeText = (valiaikainenTeksti: React.SetStateAction<string>) => setValiaikainenTeksti(valiaikainenTeksti);

  return (
    (kuvaustila)
    ? <Camera style={styles.kameranakyma} ref={kameraRef}>
        <Text style={{color:"#fff"}}>{kuvaustilaInfo}</Text>

        <FAB 
        icon="close" 
        label="Sulje" 
        style={styles.nappiSulje} 
        onPress={() => {setKuvaustila(false)}}/>
        <FAB 
        icon="close" 
        label="Ota kuva" 
        style={styles.nappiOtaKuva} 
        onPress={otaKuva}/>

      </Camera>

    : (kuvaOtettu) 
      ? <View style={styles.container}>

      <Image
        style={styles.kuva}
        source={{uri : valiaikainenKuva!.uri}}/>

      <Dialog visible={visible} onDismiss={peruuta}>

        <Dialog.Title>Anna kuvalle nimi</Dialog.Title>

        <Dialog.Content>
          <TextInput value={valiaikainenTeksti} onChangeText={onChangeText}/>
        </Dialog.Content>

        <Dialog.Actions>
          <Button onPress={peruuta}>Peruuta</Button>
          <Button onPress={eteenpain}>Ok</Button>
        </Dialog.Actions>

      </Dialog>

      </View>
    
    :<>
    <Appbar.Header>
      <IconButton
        icon="camera"
        size={30}
        style={{marginLeft:10}}
        onPress={kaynnistaKamera}
      />
    </Appbar.Header>

    <View style={styles.container}>
      
      <Text>{virhe}</Text>

     {(kuva)
      ? <>
          <Text>{kuvaTeksti}</Text>
          <Image
            style={styles.kuva}
            source={{uri : kuva!.uri}}/>
        </>

      : null }
    </View>

    <StatusBar style="auto"/>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
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
  nappiSulje : {
    position: "absolute",
    margin: 20,
    bottom: 0,
    right: 0
  },
  nappiOtaKuva : {
    position: "absolute",
    margin: 20,
    bottom: 0,
    left: 0
  },
  kuva : {
    width: 300,
    height: 400,
    resizeMode: 'stretch'
  }
});

export default App;
