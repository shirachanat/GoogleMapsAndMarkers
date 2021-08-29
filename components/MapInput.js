import React from 'react';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { StyleSheet } from 'react-native';

function MapInput(props){    
        return (
           <GooglePlacesAutocomplete 
                placeholder='חיפוש'
                minLength={2} // minimum length of text to search
                autoFocus={true}
                returnKeyType={'search'} // Can be left out for default return key 
                listViewDisplayed={true}    // true/false/undefined
                fetchDetails={true}              
                onPress={(data, details = null) => { // 'details' is provided when fetchDetails = true
                    props.notifyChange(details.geometry.location);
                }}
                query={{
                    key: 'your_API_key',
                    language: 'he'
                }}
                nearbyPlacesAPI='GooglePlacesSearch'
                debounce={300}
            />
        );
}
export default MapInput;
