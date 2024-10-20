import React from 'react'
import '../App.css'
import GeoJSON from "ol/format/GeoJSON.js";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import { Style, Fill, Stroke } from "ol/style";

function IndivdualLayerComponent({individualComponent, backendLayerList, setBackendLayerList, mapStateRef, vectorLayerArrayStateRef}) {
    
    function handleCheckBox(event, id) {
        
        if(event.target.checked){
            let temporaryArray = backendLayerList.map(obj=>{
              if(obj.id === individualComponent.id){
                return {
                  ...obj,
                  isChecked: true,
                }
              }
              return obj;
            })
            setBackendLayerList(temporaryArray);

            const url = new URL('http://localhost:9011/geoserver/ne/ows');
            const params = {
                service: "WFS",
                version: "1.0.0",
                cql_filter: `in('geometry_entity.${individualComponent.id}')`,
                request: "GetFeature",
                typeName: "ne:geometry_entity",  // No manual encoding here
                // maxFeatures: "50",
                outputFormat: "application/json",  // No manual encoding here
            };
            
            // Append query parameters to the URL
            Object.keys(params).forEach(key => {
                url.searchParams.append(key, params[key])
            });

            fetch(url, {
                method: 'GET',
                mode: 'cors',  // Adjust this if needed for CORS handling
                headers: {
                  'Accept': 'application/json',
                }
            })
            .then(response => {
              if (!response.ok) {
                if(response.status == 401 || response.status == 403){
                  sessionStorage.removeItem("accessToken");
                  sessionStorage.removeItem("username");
                  sessionStorage.removeItem("department");
                  sessionStorage.removeItem("gender");
                //   dispatch(removeAllLayer());
                //   navigate('/login')
                }
                throw new Error('Network response was not ok ' + response.statusText);
              }
              return response.json(); // Parse the JSON response
            })
            .then(obj => {
              console.log(obj);
              console.log(obj.features);
              
              obj.features[0].id = Number(obj.features[0].id.substr(16));
              
              const vectorSource = new VectorSource({
                  // Step 1: We need to create a VectorSource object of the 'layer vector object'
                  features: new GeoJSON().readFeatures(obj, {
                      featureProjection: "EPSG:3857", // Project to Web Mercator
                    }),
                });
                
                const vectorLayer = new VectorLayer({
                    // Step 2: We need to create a VectorLayer object using the VectorSource object made using the 'layer vector object'
                    source: vectorSource,
                    style: new Style({
                        fill: new Fill({
                            color: "rgba(0, 150, 136, 0.5)",
                  }),
                  stroke: new Stroke({
                      color: "#009688",
                      width: 2,
                    }),
                }),
            });
        
              vectorLayer.getSource().getFeatures()[0]["myName"] = "Varad"
        
            mapStateRef.current.addLayer(vectorLayer); // Step 3: the VectorLayer object is then added to the map
        
            mapStateRef.current.getView().fit(vectorLayer.getSource().getExtent(), {
                padding: [150, 150, 150, 150],
                duration: 1000,
              });

              vectorLayerArrayStateRef.current.push({
                id: individualComponent.id,
                vectorLayer
              })
      
            })
            .catch(error => console.error('Error fetching data:', error));

        }
        else{
            let temporaryArray2 = backendLayerList.map(obj=>{
              if(obj.id === individualComponent.id){
                return {
                  ...obj,
                  isChecked: false,
                }
              }
              return obj;
            })
            setBackendLayerList(temporaryArray2);
            
            let tempObject = vectorLayerArrayStateRef.current.find((item) => {
              return individualComponent.id === item.id;
            });
            
            vectorLayerArrayStateRef.current = vectorLayerArrayStateRef.current.filter(
              (item) => individualComponent.id !== item.id
            ); 

            mapStateRef.current.removeLayer(tempObject.vectorLayer); // Step4: That specific layer is then removed from the map

        }

    }

    return (
        <div className="flex flex-row gap-2 p-[10px_4px] overflow-hidden border-b border-gray-500 flex-shrink-0">
            <div className="flex justify-center items-center">
                <input
                type="checkbox"
                className="h-5 w-5"
                checked={individualComponent.isChecked}
                onChange={(event) => {
                    handleCheckBox(event, individualComponent.id);
                }}
                />
            </div>
            <div className="flex-grow font-semibold">
                <div>{individualComponent.layerName}</div>
            </div>
        </div>

    )
}

export default IndivdualLayerComponent