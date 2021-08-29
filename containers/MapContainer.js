import React, {useState, useEffect } from 'react';
import { Text, View , StyleSheet, Dimensions, TouchableOpacity, Modal, Alert, FlatList, TextInput, Image, Linking} from 'react-native';
import MapView, { Marker , PROVIDER_GOOGLE} from 'react-native-maps';
import { getLocation, geocodeLocationByName } from '../services/location-service';
import { MARKERS_DATA1 } from '../Mercazim.json';
import { PLANS } from '../Plans.json';

class MapContainer extends React.Component {
  state = {
      isMapReady: false,
      region: {},     
      currentCategory: 'All'  ,
      modalVisible: false,
      markerId: 0,
      markerIcon: require('../green1.png'),
      search: '',  
      searchAddress: '',
      filteredActivitiesDS: [],
      filteredMercazimDS: [],
      radiusAreaDataDS: [],
      arrMarkers: MARKERS_DATA1.map((mercaz) => (
        <Marker
        id={mercaz.events.id}
        coordinate={{
          latitude: mercaz.latitude,
          longitude: mercaz.longitude,
          latitudeDelta:0.1 ,
          longitudeDelta:0.1 ,
        }}
        title= {'mercaz'}
        pinColor= {'blue'}
        visible={ false}
        onCalloutPress= {() =>this.openModalWithItem(mercaz)}
        >
          <MapView.Callout>
            <View>
              <Text> {mercaz.name} </Text>
            </View>
          </MapView.Callout>
          </Marker>
        )),
         arrActivities: PLANS.map((activity) => (
          <Marker
          id={activity.id}
          coordinate={{
          latitude: activity.latitude,
          longitude: activity.longitude,
          latitudeDelta:0.1 ,
          longitudeDelta:0.1 ,
          }}
          title= {'activity'}
          pinColor= {'pink'}
          onCalloutPress= {() =>this.openModalWithItem(activity)}
          >
          <MapView.Callout>
            <View>
            <Text>פעילות  ( {activity.name} )</Text>
            </View>
          </MapView.Callout>
          </Marker>
          )),
          filteredDataSource: [...MARKERS_DATA1, ...PLANS],
          filteredDataSource2: [...MARKERS_DATA1, ...PLANS],
          currentMarker:PLANS[0],
          arrFiltered:[],
          markers:[],
          map:null         
  };
 
   getMarkers(){
switch (this.state.currentCategory) {
    case 'Markers': return this.state.arrMarkers;
    case 'Activities': return this.state.arrActivities;
    default: return [...this.state.arrMarkers, ...this.state.arrActivities];
}
} 
reload(){
  window.location.reload();
}

onCategoryClick(category) {
this.setState({currentCategory: category});
if(category=='Activities'){
  this.setState({filteredDataSource: PLANS}); 
  this.setState({filteredDataSource2: PLANS}); 
  this.setState({markerIcon: require('../redMarker.png')});   
}
else {
  if(category=='Markers'){
  this.setState({filteredDataSource: MARKERS_DATA1}); 
  this.setState({filteredDataSource2: MARKERS_DATA1}); 
    this.setState({markerIcon: require('../blue3.png')});
  }
  else{
    this.setState({filteredDataSource: [...MARKERS_DATA1, ...PLANS]}); 
    this.setState({filteredDataSource2: [...MARKERS_DATA1, ...PLANS]}); 
    this.setState({markerIcon: require('../green1.png')});  
  }
}
}

renderMainSearch(addressSearch){
  return (
    <View
      style={{
        backgroundColor: '#fff',
        padding: 10,
        marginVertical: 10,
        borderRadius: 20
      }}
    >
      { <TextInput
      autoCapitalize="none"
      autoCorrect={false}
      style={styles.inputStyle}
      placeholder="חיפוש"
      value={addressSearch}
      onChangeText={(text2) => this.filterAddressSearch(text2)}       
    /> }
    
    </View>
  );
}

renderHeaderPopup(){
  return (
<Text style={styles.titlePopup}>{this.state.currentMarker.name}</Text>
  );
}
 
filterAddressSearch(text2) {
  if (text2) {
     const newData = this.state.filteredDataSource2.filter(function (item) {      
      const itemData = item.name
      ? item.name.toUpperCase()
      : ''.toUpperCase();
    const textData = text2.toUpperCase();
    return itemData.indexOf(textData) > -1;
    }); 
    this.setState({filteredDataSource: newData});
    this.setState({searchAddress: text2});
  } else {
    this.setState({searchAddress: text2});
  }

setTimeout(() => {
  const coords = this.state.filteredDataSource.map((element) => {
    return {
      latitude: element.latitude,
      longitude: element.longitude,
    };
  });

   this.state.map.fitToCoordinates(coords, {
    edgePadding: {
      bottom: 200,
      right: 50,
      top: 150,
      left: 50,
    },
    animated: true,
  }); 
}, 300);
}  

GetGridViewItem (item) {
Alert.alert(item.act +"\n"+  item.url+"\n"+item.days+ item.time );
}
closeModal() {
  this.setState({modalVisible: false});
}

openModalWithItem(marker) {
  this.state.markers[marker.id].hideCallout();
  this.setState({markerId: marker.id});     
  this.setState({currentMarker: marker});
 
this.setState({modalVisible: !this.state.modalVisible});
} 
  componentDidMount() {
      this.getInitialState();
      this.state.map.fitToSuppliedMarkers(
       this.state.filteredDataSource,
       false,
      );
  }

  getInitialState() {  
      getLocation().then(
          (data) => {
              console.log(data);
              this.setState({
                  region: {
                      latitude: data.latitude,
                      longitude: data.longitude,
                      latitudeDelta: 0.1,
                      longitudeDelta: 0.1
                  }
              });         
          }
      );

  }

  getCoordsFromName(loc) {
    this.setState({
        region: {
            latitude: loc.lat,
            longitude: loc.lng,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1
        }
    });   
}
  
  onMapRegionChange(region) {
      this.setState({ region });
  }
  
  onMapLayout = () => {
      this.setState({ isMapReady: true });
    }

  render() {
      return (
          <View style={{ flex: 1 }}>
              <View style={{ height: 100 }, {flex:1}}>              
                 <FlatList
                      ListHeaderComponent={this.renderMainSearch(this.state.addressSearch)}
                      style={{
                        width: "100%",
                        height: "40%"                      
                      }}
                      data={this.state.filteredDataSource}                    
                      keyExtractor={item => item.id}
                      extraData={this.state.filteredDataSource}
                        renderItem={({ item }) => (
                          <View style={styles.listItem}>         
                            <Image
                              source={ this.state.markerIcon }
                              style={styles.coverImage}
                            />
                            <View style={styles.metaInfo}>
                              <Text style={styles.title}
                              onPress={() =>this.openModalWithItem(item)} >{`${item.name}`}</Text>
                            </View>
                          </View>
                        )}
                    />
              </View> 
              {/*  <View style={{ height: 100 }, {flexDirection: 'row-reverse'}}>
                  <MapInput notifyChange={(loc) => this.getCoordsFromName(loc)}
                  />
              </View>    */}  
              <Modal            
                  animationType="slide"
                  transparent= {true}
                  visible={this.state.modalVisible}
                  closeModal={this.closeModal}
                >
                  <View
                  style={{
                    height: '100%',
                    backgroundColor: '#EEECEC'
                  }}>
                  <TouchableOpacity onPress={() => this.closeModal()}>
                  <Text style={styles.exitBtn}>X</Text>
                </TouchableOpacity>
                  <FlatList
                      ListHeaderComponent={this.renderHeaderPopup()}
                      data={this.state.currentMarker.events}                    
                      keyExtractor={item => item.id}
                        renderItem={({ item }) => (
                          <View style={styles.listItem2} >         
                            <Image                           
                              source={require('../aa.png')}
                              style={styles.coverImage2}
                            />
                            <View style={styles.metaInfo2}>
                              <Text style={styles.title2} onPress={() =>this.GetGridViewItem(item)} >{`${item.act}`}</Text>
                              <Text style={styles.titleTime} > {`${item.days} ${item.time}`}</Text>                             
                              <Text style={styles.url} onPress={() =>Linking.openURL(item.url)}>להרשמה</Text>
                            </View>
                          </View>
                        )}
                    />
                  </View>
                  </Modal>                                                
              {this.state.region['latitude'] ? (<MapView
                      style={styles.map}                                                                      
                      initialRegion={this.state.region}
                      region={this.state.region}
                      provider={PROVIDER_GOOGLE}
                      onLayout={this.onMapLayout}
                      >  
                        <MapView.Circle
                      center={{latitude: 31.78,
                      longitude: 35.173}}
                      radius= {15000}
                      ></MapView.Circle>                    
                       {this.state.filteredDataSource.map((activity)=> (
                        <MapView.Marker
                        id={activity.id}
                      coordinate={{
                        latitude: activity.latitude,
                        longitude: activity.longitude,
                        latitudeDelta:0.1 ,
                        longitudeDelta:0.1 ,
                      }}
                      title= {'activity'}
                      pinColor= {'yellow'}
                      >
                        <MapView.Callout>
                          <View>
                          <Text>AC</Text>
                          </View>
                        </MapView.Callout>
                      </MapView.Marker>
                      ))}
                  </MapView>): (
                      <MapView
                      ref={(ref) => { this.state.map= ref;}}
                          loadingEnabled={true}
                          provider={PROVIDER_GOOGLE}
                          onLayout={this.onMapLayout}
                          style={[styles.map]}
                      >
                        {this.state.filteredDataSource.map((marker)=> (
                    <Marker
                    key={marker.id}
                    ref={ ref => {
                      this.state.markers[marker.id] = ref;
                    }}
                    id={marker.id}
                    coordinate={{
                    latitude: marker.latitude,
                    longitude: marker.longitude,
                    latitudeDelta:0.1 ,
                    longitudeDelta:0.1 ,
                    }}
                    title= {'activity'}
                    pinColor= {marker.color}
                    onCalloutPress= {() =>this.openModalWithItem(marker)}
                    >
                    <MapView.Callout>
                      <View>
                      <Text>{marker.type}  ( {marker.name} )</Text>
                      </View>
                    </MapView.Callout>
                    </Marker>
                      ))}
                      </MapView>
                  )
              }
                <View style={{
              position: 'absolute',
              top:10,
              right:0,
              width : "20%"           
              }}>
                    <TouchableOpacity style={styles.btnAll} onPress={() => this.onCategoryClick('All')}>
                  <Text size={15} name='restaurant-outline'>הכל</Text>
                    </TouchableOpacity>
                  <TouchableOpacity style={styles.btnMercaz}  onPress={() => this.onCategoryClick('Markers')}>
                        <Text size={15} name='restaurant-outline'>מרכזים</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.btnAct} onPress={() => this.onCategoryClick('Activities')}>
                        <Text size={15} name='bed-outline'>פעילויות</Text>
                  </TouchableOpacity>
                </View>
          </View>                 
      );
  }
}

export default MapContainer;

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  },
btnAll:{
  borderRadius: 2,
    elevation: 3,
    height: 35,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: 'lightgreen'
},
btnMercaz:{
  borderRadius: 2,
    elevation: 3,
    height: 35,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: 'blue'
},
btnAct:{
  borderRadius: 2,
    elevation: 3,
    height: 35,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: 'red'
},
  map: {

    flex:1,
    width: Dimensions.get('window').width,

    height: Dimensions.get('window').height,

  },

  GridViewBlockStyle: {

    justifyContent: 'center',
    flex:1,
    alignItems: 'center',
    height: 100,
    margin: 5,
    backgroundColor: '#00BCD4'
  
  },
  
GridViewInsideTextItemStyle: {

  color: '#fff',
  padding: 10,
  fontSize: 18,
  justifyContent: 'center',
  
},
exitBtn:{
  
fontSize:20,
},

container: {
  flex: 1,
  backgroundColor: '#f8f8f8',
  alignItems: 'center'
},
text: {
  fontSize: 20,
  color: '#101010',
  marginTop: 60,
  fontWeight: '700'
},
listItem: {
  marginTop: 3,
   paddingVertical: 10,
  paddingHorizontal: 10, 
  backgroundColor: '#fff',
  flexDirection: 'row'
},
coverImage: {
  width: 50,
  height: 50,
  borderRadius: 4
},
metaInfo: {
  marginLeft: 5
},
title: {
  fontSize: 13.5,
  width: 100,
  padding: 5
},

listItem2: {
  marginTop: 10,
  paddingVertical: 20,
  paddingHorizontal: 20,
  backgroundColor: '#fff',
  flexDirection: 'row'
},
coverImage2: {
  width: 100,
  height: 100,
  borderRadius: 8
},
metaInfo2: {
  marginLeft: 10
},
title2: {
  fontSize: 19,
  width: 200,
  padding: 3
},
titleTime:{
  fontSize: 17,
  width: 200,
  padding: 3
},
titlePopup:{
fontSize: 20
},
 url:{
  fontSize: 17,
  width: 200,
  padding: 3,
color:'purple'
 },
});