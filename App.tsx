import * as React from 'react';
import {
  StatusBar,
  FlatList,
  Image,
  Animated,
  Text,
  View,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  Easing,
  SafeAreaViewBase,
  SafeAreaView,
} from 'react-native';
import API_KEY from './apiKey';
const { width, height } = Dimensions.get('screen');

const API_URL =
  'https://api.pexels.com/v1/search?query=nature&orientation=portrait&size=small&per_page=20';
const IMAGE_SIZE = 80;
const SPACING = 10;

const fechtImagesFromPexels = async () => {
  const data = await fetch(API_URL, {
    headers: {
      Authorization: API_KEY,
    },
  });

  const { photos } = await data.json();

  photos.map((item: ImagePexel) => Image.prefetch(item.src.portrait));

  return photos;
};

type ImagePexel = {
  avg_color: string;
  height: number;
  id: string;
  liked: boolean;
  src: {
    landscape: string;
    large: string;
    larg2x: string;
    medium: string;
    portrait: string;
    small: string;
    tiny: string;
  };
};

function App() {
  const [activeIndex, setActiveIndex] = React.useState<number>(0);
  const [images, setImages] = React.useState<ImagePexel[] | null>(null);

  React.useEffect(() => {
    const fetchImages = async () => {
      const images: ImagePexel[] = await fechtImagesFromPexels();

      setImages(images);
    };

    fetchImages();
  }, []);

  const topRef = React.useRef<FlatList>(null);
  const thumbRef = React.useRef<FlatList>(null);

  const scrollToActiveIndex = (index: number) => {
    setActiveIndex(index);
    topRef.current?.scrollToOffset({
      offset: index * width,
      animated: true,
    });

    if (index * (IMAGE_SIZE + SPACING) - IMAGE_SIZE / 2 > width / 2) {
      thumbRef.current?.scrollToOffset({
        offset: index * (IMAGE_SIZE + SPACING) - width / 2 + IMAGE_SIZE / 2,
        animated: true,
      });
    } else {
      thumbRef.current?.scrollToOffset({
        offset: 0,
        animated: true,
      });
    }
  };

  if (images === null) {
    return (
      <View
        style={{
          flex: 1,
          height: height,
          width: width,
          backgroundColor: '#0000',
        }}>
        <Text style={{ color: '#ffff' }}>Loading</Text>
      </View>
    );
  }
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#0000',
        height: height,
        width: width,
      }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="default" />
      <FlatList
        ref={topRef}
        data={images}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onMomentumScrollEnd={(ev) => {
          scrollToActiveIndex(
            Math.round(ev.nativeEvent.contentOffset.x / width),
          );
        }}
        renderItem={({ item }) => {
          return (
            <View style={{ width, height }}>
              <Image
                style={[StyleSheet.absoluteFillObject]}
                source={{ uri: item.src.portrait, cache: 'force-cache' }}
              />
            </View>
          );
        }}
      />
      <FlatList
        ref={thumbRef}
        data={images}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        bounces={false}
        style={{
          position: 'absolute',
          bottom: IMAGE_SIZE,
        }}
        contentContainerStyle={{
          paddingHorizontal: SPACING,
        }}
        renderItem={({ item, index }) => {
          return (
            <TouchableOpacity onPress={() => scrollToActiveIndex(index)}>
              <Image
                style={{
                  width: IMAGE_SIZE,
                  height: IMAGE_SIZE,
                  borderRadius: 12,
                  marginRight: SPACING,
                  borderWidth: 2,
                  borderColor: activeIndex === index ? '#ffff' : 'transparent',
                }}
                source={{ uri: item.src.portrait, cache: 'force-cache' }}
              />
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

export default App;
