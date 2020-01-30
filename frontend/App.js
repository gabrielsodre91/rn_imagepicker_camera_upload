import React, { useState, useEffect } from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  AsyncStorage,
  ScrollView
} from 'react-native';

import Spinner from 'react-native-loading-spinner-overlay';

import axios from 'axios';
import api from './src/services/api';

import * as Permissions from 'expo-permissions';
import * as ImagePicker from 'expo-image-picker';

export default App = () => {
  const [foto, setFoto] = useState(null);
  const [imagens, setImagens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [percentUpload, setPercentUpload] = useState(0);

  const tirarFoto = async () => {
    const { granted } = await Permissions.askAsync(Permissions.CAMERA);

    if (granted) {
      const data = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
      });

      setFoto(data.uri);
      upload(data.uri);
    }
  }

  const fotoGaleria = async () => {
    const { granted } = await Permissions.askAsync(Permissions.CAMERA_ROLL);

    if (granted) {
      const data = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [4, 3],
      });

      setFoto(data.uri);
      upload(data.uri);
    }
  }

  const upload = async (uri) => {
    let uriParts = uri.split('.');
    let fileType = uriParts[uriParts.length - 1];

    let formData = new FormData();
    formData.append('imagem', {
      uri,
      name: `imagem.${fileType}`,
      type: `image/${fileType}`,
    });

    setLoading(true);

    const imagemSalva = await api.post('uploadImage', formData, {
      onUploadProgress: function (progressEvent) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);

        setPercentUpload(percentCompleted);
      }
    });

    try {
      let imagensSalvas = await AsyncStorage.getItem('imagens');
      imagensSalvas = JSON.parse(imagensSalvas) || [];

      imagensSalvas.push({
        data: Date.now(),
        url: imagemSalva.data.filename,
        uri
      });

      imagensSalvas.sort((a, b) => b.data - a.data);

      setImagens(imagensSalvas);

      await AsyncStorage.setItem('imagens', JSON.stringify(imagensSalvas));
    } catch (error) {
      console.log(error);
    }

    setLoading(false);
  }

  selecionarFoto = async (imagem) => {
    let arquivoRemoto = `${api.defaults.baseURL}/imagens/${imagem.url}`;

    setFoto(arquivoRemoto);
  }

  const formatarData = data => `${('00' + data.getDate()).slice(-2)}/${('00' + (data.getMonth() + 1)).slice(-2)}/${data.getFullYear()} ${('00' + data.getHours()).slice(-2)}:${('00' + data.getMinutes()).slice(-2)}:${('00' + data.getSeconds()).slice(-2)}`;

  useEffect(() => {
    const carregarImagens = async () => {
      try {
        let imagensSalvas = await AsyncStorage.getItem('imagens');
        imagensSalvas = JSON.parse(imagensSalvas) || [];

        imagensSalvas.sort((a, b) => b.data - a.data);

        setImagens(imagensSalvas);
      } catch (error) {
        console.log(error);
      }
    }

    carregarImagens();
  }, []);

  return (
    <View style={styles.container}>
      <Spinner
        visible={loading}
        color={'black'}
        overlayColor={'rgba(255, 255, 255, 0.7)'}
        textContent={`Enviando (${percentUpload}%)`}
      />

      <Image style={styles.fotoExibicao} resizeMode='cover' source={{ uri: foto }} />

      <View style={styles.botoes}>
        <View style={styles.containerBotaoGaleria}>
          <TouchableOpacity onPress={fotoGaleria} style={styles.botaoGaleria}>
            <Text style={styles.textoBotaoGaleria}>Galeria</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.containerBotaoCamera}>
          <TouchableOpacity onPress={tirarFoto} style={styles.botaoCamera}>
            <Text style={styles.textoBotaoCamera}>Câmera</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.listaFotos}>
        {imagens.map(imagem => {
          return (
            <View styles={styles.itemLista} key={`${imagem.data}`}>
              <TouchableOpacity onPress={() => { selecionarFoto(imagem) }} style={styles.botaoLista}>
                <Image style={styles.imagemLista} source={{ uri: `${api.defaults.baseURL}/imagens/${imagem.url}` }} />
                <Text>{formatarData(new Date(imagem.data))}</Text>
              </TouchableOpacity>
            </View>
          )
        })
        }
      </ScrollView>

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'stretch'
  },

  fotoExibicao: {
    height: 300,
    marginTop: 60,
    backgroundColor: '#eee'
  },

  containerBotaoGaleria: {
    margin: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },

  botaoGaleria: {
    backgroundColor: 'skyblue',
    height: 50,
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#eee',
    borderWidth: 1,
    borderRadius: 25
  },

  listaFotos: {
    //maxHeight: 200,
    marginTop: 20
  },

  itemLista: {

  },

  imagemLista: {
    margin: 10,
    width: 50,
    height: 50,
    borderRadius: 25
  },

  botaoLista: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#000'
  },

  botoes: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },

  textoBotaoGaleria: {

  },

  containerBotaoCamera: {
    margin: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },

  botaoCamera: {
    backgroundColor: 'powderblue',
    height: 50,
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#eee',
    borderWidth: 1,
    borderRadius: 25
  },

  textoBotaoCamera: {

  },
});