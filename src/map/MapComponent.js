import React, { useEffect, useRef, useState } from "react";
import { Map, View } from "ol";
// import TileLayer from 'ol/layer/Tile';
import OSM from "ol/source/OSM";
import "ol/ol.css";
import { Tile as TileLayer } from "ol/layer";
import { TileWMS } from "ol/source";
import { fromLonLat } from "ol/proj";
import { getArea, getLength } from "ol/sphere";
// import { getArea as getGeodesicArea } from 'ol/sphere';
// import 'font-awesome/css/font-awesome.min.css';
import "../App.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { toLonLat } from "ol/proj";
import { LineString } from "ol/geom";
import { Polygon } from "ol/geom";
import Control from "ol/control/Control.js";
import { Vector as VectorLayer } from "ol/layer";
import { Vector as VectorSource } from "ol/source";
import { Style, Stroke, Fill, Circle as CircleStyle } from "ol/style";
import { Draw } from "ol/interaction";
import Overlay from "ol/Overlay";
import { toStringHDMS } from 'ol/coordinate';
import Modify from "ol/interaction/Modify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faRulerHorizontal,
    faRulerCombined,
    faDrawPolygon,
    faLinesLeaning,
    faLocationDot,
    faTrashAlt,
    faHome,
    faToolbox,
} from "@fortawesome/free-solid-svg-icons";

{
    /* <FontAwesomeIcon icon={faTrashAlt} /> */
}

function MapComponent({ mapStateRef }) {

    // Reference to the map container

    // ---------------------------------------------------------------------- State Variables and Refs start ----------------------------------------------------------------------

                                // -------------------------- Dom element refs start --------------------------

    const mapRef = useRef();   
    let featurePopupRef = useRef(); 

                                // -------------------------- Dom element refs ends --------------------------

    // These 2 statvariables holds the vector source for polyline and polygon which will be used to measure distance and area

    const [lineVectorSource] = useState(new VectorSource());    
    const [polygonVectorSource] = useState(new VectorSource());

    const tooltipsRef = useRef([]); // Holds the references of all the tooltips which are appled on the measurement related polyline and polygon   
    
    let [drawInteractionState, setDrawInteractionState] = useState(null);   // Could be converted to ref 
    
    let drawnPolygonArrayRef = useRef([]);
    let [isDrawPolygonStateEnabled, setIsDrawPolygonStateEnabled] = useState(false);
    
    let [clickedVectorSource, setClickedVectorSource] = useState();     // Cannot be converted to ref
        
    let [featurePopupOverlayState, setFeaturePopupOverlayState] = useState(null);     // Could be converted to ref

    let [currentlyGettingEditedFeatureId, setCurrentlyGettingEditedFeatureId] = useState(null);     // Cannot be converted to ref
    let [modifyInteractionState, setModifyInteractionState] = useState(null);   // Could be converted to ref
    let [editedFeatureIdArray, setEditedFeatureIdArray] = useState([]);     // Cannot be converted to ref
    
                                // -------------------------- Triggers start --------------------------
    
    let [triggerObjectForCheckingCurrentlyBeingEditedFeatureId, setTriggerObjectForCheckingCurrentlyBeingEditedFeatureId] = useState({
        triggerState: false,
        feature: null,
    });

    let [triggerForRemovingModifyInteractionForNonFeatureClick, setTriggerForRemovingModifyInteractionForNonFeatureClick] = useState(false);

                                // --------------------------- Triggers end ---------------------------

    const cdacWMSLayer1 = {
        layer_name: "your_layer_name", // Replace with the actual layer name
        format: "image/png", // Specify the desired image format
        data: "your_data", // Add data information if needed
        received_timestamp: "your_timestamp",
        sensor: "your_sensor",
        id: "your_id",
        date: "your_date",
        image: "your_image",
        min_long: 68.0, // Example value, replace with actual
        min_latt: 8.0, // Example value, replace with actual
        max_long: 85.0, // Example value, replace with actual
        max_latt: 37.0, // Example value, replace with actual
    };

    const cdacWMSLayerAttributes = {
        layers: cdacWMSLayer1.layer_name,
        transparent: false,
        format: cdacWMSLayer1.format,
        zIndex: 10010,
        // Add any other necessary WMS parameters
    };

    // ---------------------------------------------------------------------- State Variables and Refs ends ----------------------------------------------------------------------

    // ------------------------------------------------------------------------------------- Utility functions Start -------------------------------------------------------------------------------------

    // This function return true if the click event has occured on the popup

    const isClickOnOverlay = (pixel, mapElement, overlayElement) => {
        const mapRect = mapElement.getBoundingClientRect(); // Get map container bounds
        const rect = overlayElement.getBoundingClientRect();

        // Convert the map's pixel coordinates into screen coordinates
        const screenX = mapRect.left + pixel[0];
        const screenY = mapRect.top + pixel[1];

        // Check if the screen coordinates fall within the overlay's bounding rectangle
        return (
            screenX >= rect.left &&
            screenX <= rect.right &&
            screenY >= rect.top &&
            screenY <= rect.bottom
        );
    };

    // This function converts the coordinates and user the geoserver's layer id to generate the xml request data so that we can update the layer

    function convertToGMLForLayerUpdationinGeoServer(object) {
        let coordinates = object.coordinates;
        let id = object.id;
        const gml = [];
        gml.push('<?xml version="1.0" encoding="UTF-8"?>');
        gml.push('<wfs:Transaction service="WFS" version="1.0.0"');
        gml.push('    xmlns:wfs="http://www.opengis.net/wfs"');
        gml.push('    xmlns:gml="http://www.opengis.net/gml"');
        gml.push('    xmlns:ne="https://www.naturalearthdata.com"');
        gml.push('    xmlns:ogc="http://www.opengis.net/ogc"');
        gml.push('    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"');
        gml.push(
            '    xsi:schemaLocation="http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.0.0/WFS-transaction.xsd https://www.naturalearthdata.com http://localhost:9011/geoserver/wfs/DescribeFeatureType?typename=ne:geometry_entity">'
        );
        gml.push('  <wfs:Update typeName="ne:geometry_entity">');
        gml.push("    <wfs:Property>");
        gml.push("      <wfs:Name>geom</wfs:Name>");
        gml.push("      <wfs:Value>");
        gml.push(
            '        <gml:Polygon srsName="http://www.opengis.net/gml/srs/epsg.xml#4326">'
        );
        gml.push("          <gml:outerBoundaryIs>");
        gml.push("            <gml:LinearRing>");
        gml.push('              <gml:coordinates decimal="." cs="," ts=" ">');

        const gmlCoordinates = coordinates
            .map((coord) => `${coord.lng},${coord.lat}`)
            .join(" ");

        gml.push(gmlCoordinates);
        gml.push("              </gml:coordinates>");
        gml.push("            </gml:LinearRing>");
        gml.push("          </gml:outerBoundaryIs>");
        gml.push("        </gml:Polygon>");
        gml.push("      </wfs:Value>");
        gml.push("    </wfs:Property>");
        gml.push("    <ogc:Filter>");
        gml.push(`      <ogc:FeatureId fid="geometry_entity.${id}"/>`);
        gml.push("    </ogc:Filter>");
        gml.push("  </wfs:Update>");
        gml.push("</wfs:Transaction>");

        return gml.join("\n");
    }


    // ------------------------------------------------------------------------------------- Utility functions End -------------------------------------------------------------------------------------


    useEffect(() => {

        // Initialize the map
        const initialMap = new Map({
            target: mapRef.current,
            layers: [
                new TileLayer({
                    source: new OSM(),
                }),
            ],
            view: new View({
                center: [9000000, 2550000],
                zoom: 5,
            }),
        });

        // popup (overlay) object initialization
        let featurePopupOverlay = new Overlay({
            element: featurePopupRef.current,
            positioning: "bottom-center",
            offset: [0, 0],
        });

        initialMap.addOverlay(featurePopupOverlay);
        setFeaturePopupOverlayState(featurePopupOverlay);

        const lineVectorLayer = new VectorLayer({
            source: lineVectorSource,
            style: new Style({
                stroke: new Stroke({
                    color: "#009688",
                    width: 2,
                }),
                image: new CircleStyle({
                    radius: 5,
                    fill: new Fill({ color: "blue" }),
                    stroke: new Stroke({
                        color: "white",
                        width: 2,
                    }),
                }),
            }),
        });

        const polygonVectorLayer = new VectorLayer({
            source: polygonVectorSource,
            style: new Style({
                fill: new Fill({
                    color: "rgba(0, 150, 136, 0.5)",
                }),
                stroke: new Stroke({
                    color: "#009688",
                    width: 2,
                }),
                image: new CircleStyle({
                    radius: 5,
                    fill: new Fill({ color: "blue" }),
                    stroke: new Stroke({
                        color: "white",
                        width: 2,
                    }),
                }),
            }),
        });

        initialMap.addLayer(lineVectorLayer);
        initialMap.addLayer(polygonVectorLayer);


        initialMap.on("click", function (event) {

            const overlayElement = featurePopupRef.current;
            const mapElement = mapRef.current;

            const feature = initialMap.forEachFeatureAtPixel(
                event.pixel,
                function (feature) {
                    return feature;
                }
            );

            if (
                feature ||
                (overlayElement &&
                    isClickOnOverlay(event.pixel, mapElement, overlayElement))
            ) {

                if (feature) {

                    console.log(feature.isADrawFeature);

                    // This is specific to polygon to set the position 
                    
                    const geometry = feature.getGeometry();
                    // console.log(event.coordinate);
                    
                    if(feature.isADrawFeature){
                        if (geometry.getInteriorPoint) {
                            const coordinates = geometry.getInteriorPoint().getCoordinates();
                            console.log(featurePopupOverlay);
                            console.log(coordinates);
                            featurePopupOverlay.setPosition(coordinates);
                            // featurePopupOverlay.setPosition(event.coordinate);
                        }
                        else{
                            featurePopupOverlay.setPosition(event.coordinate);
                        }
                    }


                    initialMap.getLayers().forEach(function (layer) {
                        if (layer instanceof VectorLayer) {
                            const vectorSource = layer.getSource();
                            // Check if the feature is part of the vector source
                            if (vectorSource.hasFeature(feature)) {
                                setClickedVectorSource(vectorSource);
                            }
                        }
                    });

                    setTriggerObjectForCheckingCurrentlyBeingEditedFeatureId({
                        triggerState: true,
                        feature,
                    });
                }
            } else {
                featurePopupOverlay.setPosition(null);
                setClickedVectorSource(null);
                setCurrentlyGettingEditedFeatureId(null);
                setTriggerForRemovingModifyInteractionForNonFeatureClick(true);
            }
        });

        mapStateRef.current = initialMap;

        var toolbarElement = document.createElement("div");
        toolbarElement.className = "measurment-toolbar ol-unselectable ol-control";

        var distanceLinestringButton = document.createElement("button");
        distanceLinestringButton.innerHTML =
            '<i class="fa-solid fa-ruler-horizontal"></i>';
        distanceLinestringButton.title = "Measure Line Polyline Distance";
        distanceLinestringButton.className = "btn btn-primary";
        distanceLinestringButton.addEventListener(
            "click",
            startMeasuringLinestringDistance
        );

        var areaPolygonButton = document.createElement("button");
        areaPolygonButton.innerHTML = '<i class="fa-solid fa-ruler-combined"></i>';
        areaPolygonButton.title = "Measure Line Polygon Area";
        areaPolygonButton.className = "btn btn-primary";
        areaPolygonButton.addEventListener("click", startMeasuringPolygonArea);

        var drawPolygonButton = document.createElement("button");
        drawPolygonButton.innerHTML = '<i class="fa fa-draw-polygon"></i>';
        drawPolygonButton.title = "Draw Polygon";
        drawPolygonButton.className = "btn btn-secondary";
        drawPolygonButton.addEventListener("click", drawPolygon);

        var drawPolygonLine = document.createElement("button");
        drawPolygonLine.innerHTML = '<i class="fa-solid fa-lines-leaning"></i>';
        drawPolygonLine.title = "Draw Polyline";
        drawPolygonLine.className = "btn btn-secondary";
        drawPolygonLine.addEventListener("click", () => { });

        var drawPoint = document.createElement("button");
        drawPoint.innerHTML = '<i class="fa-solid fa-location-dot"></i>';
        drawPoint.title = "Draw Point";
        drawPoint.className = "btn btn-secondary";
        drawPoint.addEventListener("click", () => { });

        var clearButton = document.createElement("button");
        clearButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
        clearButton.title = "Clear Geometries";
        clearButton.className = "btn btn-danger";
        clearButton.addEventListener("click", clearMap);

        var resetMapButton = document.createElement("button");
        resetMapButton.innerHTML = '<i class="fa fa-home">';
        resetMapButton.title = "Reset Map";
        resetMapButton.className = "btn btn-secondary";
        resetMapButton.addEventListener("click", resetMap);

        // toolbarElement.appendChild(distanceLinestringButton);
        // toolbarElement.appendChild(areaPolygonButton);
        // toolbarElement.appendChild(drawPolygonButton);
        // toolbarElement.appendChild(drawPolygonLine);
        // toolbarElement.appendChild(drawPoint);
        // toolbarElement.appendChild(clearButton);
        // toolbarElement.appendChild(resetMapButton);

        var toolbarControl = new Control({
            element: toolbarElement,
        });
        initialMap.addControl(toolbarControl);

        return () => {
            if (initialMap) {
                initialMap.setTarget(null);
            }
        };
    }, []);

    // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

    // Section Started: Functions handling the click events of the toolbar buttons

    const startMeasuringLinestringDistance = () => {

        const drawInteraction = new Draw({
            source: lineVectorSource,
            type: "LineString",
            maxPoints: 2,
            style: new Style({
                stroke: new Stroke({
                    color: "#009688",
                    width: 2,
                }),
                image: new CircleStyle({
                    radius: 5,
                    fill: new Fill({ color: "#009688" }),
                    stroke: new Stroke({
                        color: "white",
                        width: 2,
                    }),
                }),
            }),
        });

        drawInteraction.on("drawstart", (event) => {
            const sketch = event.feature;
            const tooltipElement = document.createElement("div");
            tooltipElement.className = "tooltip";
            tooltipElement.style.position = "absolute";
            tooltipElement.style.background = "white";
            tooltipElement.style.padding = "5px";
            tooltipElement.style.border = "1px solid black";
            tooltipElement.style.borderRadius = "3px";
            tooltipElement.style.pointerEvents = "none";

            const overlay = new Overlay({
                element: tooltipElement,
                offset: [0, -33],
                positioning: "center-left",
                // zIndex: 1000,
            });
            mapStateRef.current.addOverlay(overlay);
            tooltipsRef.current.push(overlay); // Store the overlay for this sketch

            // Listen for geometry change to update the tooltip in real-time
            sketch.getGeometry().on("change", (evt) => {
                const geom = evt.target;

                const coordinates = geom.getCoordinates();
                const length = getLength(new LineString(coordinates));
                const lastCoord = coordinates[coordinates.length - 1];

                tooltipElement.innerHTML = `${length.toFixed(2)} meters`;
                overlay.setPosition(lastCoord); // Update tooltip position
            });
        });

        drawInteraction.on("drawend", (event) => {
            const finalCoords = event.feature.getGeometry().getCoordinates();
            const finalLength = getLength(new LineString(finalCoords));
            const lastCoord = finalCoords[finalCoords.length - 1];
            const finalTooltip = tooltipsRef.current[tooltipsRef.current.length - 1].getElement();
            finalTooltip.innerHTML = `${finalLength.toFixed(2)} meters`;
            tooltipsRef.current[tooltipsRef.current.length - 1].setPosition(
                lastCoord,
            );
            mapStateRef.current.removeInteraction(drawInteraction); // Stop drawing after second point
        });

        mapStateRef.current.addInteraction(drawInteraction);

    };

    const startMeasuringPolygonArea = () => {
        const drawInteraction = new Draw({
            source: polygonVectorSource,
            type: "Polygon",
            style: new Style({
                fill: new Fill({
                    color: "rgba(0, 150, 136, 0.5)",
                }),
                stroke: new Stroke({
                    color: "#009688",
                    width: 2,
                }),
                image: new CircleStyle({
                    radius: 5,
                    fill: new Fill({ color: "#009688" }),
                    stroke: new Stroke({
                        color: "white",
                        width: 2,
                    }),
                }),
            }),
        });

        drawInteraction.on("drawstart", (event) => {
            const sketch = event.feature;

            const tooltipElement = document.createElement("div");
            tooltipElement.className = "tooltip";
            tooltipElement.style.position = "absolute";
            tooltipElement.style.background = "white";
            tooltipElement.style.padding = "5px";
            tooltipElement.style.border = "1px solid black";
            tooltipElement.style.borderRadius = "3px";
            tooltipElement.style.pointerEvents = "none";
            tooltipElement.style.textWrap = "nowrap";

            const overlay = new Overlay({
                element: tooltipElement,
                offset: [0, -33],
                positioning: "center-left",
            });
            mapStateRef.current.addOverlay(overlay);
            tooltipsRef.current.push(overlay); // Store the overlay for this sketch

            // Listen for geometry change to update the tooltip in real-time
            sketch.getGeometry().on("change", (evt) => {
                const geom = evt.target;

                const coordinates = geom.getCoordinates();
                const area = getArea(new Polygon(coordinates));

                let tootipCoordinates = geom.getInteriorPoint().getCoordinates();

                tooltipElement.innerHTML = `${area.toFixed(2)} square meters`;
                overlay.setPosition(tootipCoordinates); // Update tooltip position
            });
        });

        drawInteraction.on("drawend", (event) => {
            const coordinates = event.feature.getGeometry().getCoordinates();

            const area = getArea(new Polygon(coordinates));
            let tootipCoordinates = event.feature
                .getGeometry()
                .getInteriorPoint()
                .getCoordinates();

            // Keep tooltip at the final position

            const finalTooltip =
                tooltipsRef.current[tooltipsRef.current.length - 1].getElement();
            finalTooltip.innerHTML = `${area.toFixed(2)} square meters`;
            tooltipsRef.current[tooltipsRef.current.length - 1].setPosition(
                tootipCoordinates
            );

            mapStateRef.current.removeInteraction(drawInteraction); // Stop drawing after second point
        });

        mapStateRef.current.addInteraction(drawInteraction);
    };

    function clearMap() {
        lineVectorSource.clear();
        polygonVectorSource.clear();
        tooltipsRef.current.forEach((obj) => {
            mapStateRef.current.removeOverlay(obj);
        });
        tooltipsRef.current = [];
    }

    function resetMap() {
        mapStateRef.current.getView().animate({
            center: [9000000, 2550000],
            zoom: 5,
            duration: 1000,
        });
    }

    function drawPolygon() {

        // console.log(drawInteractionState);
        // console.log(isDrawPolygonStateEnabled);

        if (drawInteractionState !== null && drawInteractionState.mode_ === "Polygon") {

            mapStateRef.current.removeInteraction(drawInteractionState);
            setDrawInteractionState(null);
            // setIsDrawPolygonStateEnabled(false);
            
        } else {
            
            if(drawInteractionState){
                // setDrawInteractionState(null);
                mapStateRef.current.removeInteraction(drawInteractionState);
            }

            const vectorSource = new VectorSource();
            vectorSource["isADrawFeature"] = true;
            const vectorLayer = new VectorLayer({
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
                zIndex: 5,
            });

            let drawInteraction = new Draw({
                source: vectorSource,
                type: "Polygon",
            });

            drawInteraction.on("drawend", (e) => {
                console.log(e.feature);
                e.feature["isADrawFeature"] = true;
                mapStateRef.current.addLayer(vectorLayer);
                // drawnPolygonArrayRef.current.push(vectorLayer);
                drawnPolygonArrayRef.current.push({
                    id: vectorLayer.getSource().ol_uid,
                    vectorLayer,
                });
                mapStateRef.current.removeInteraction(drawInteraction);
                setDrawInteractionState(null);
                // setIsDrawPolygonStateEnabled(false);
            });

            console.log(drawInteraction);

            mapStateRef.current.addInteraction(drawInteraction);
            setDrawInteractionState(drawInteraction);
            // setIsDrawPolygonStateEnabled(true);
        }

        // if (isDrawPolygonStateEnabled) {

        //     mapStateRef.current.removeInteraction(drawInteractionState);
        //     setDrawInteractionState(null);
        //     setIsDrawPolygonStateEnabled(false);
            
        // } else {
            
        //     if(drawInteractionState){
        //         setDrawInteractionState(null);
        //     }

        //     const vectorSource = new VectorSource();
        //     vectorSource["isADrawFeature"] = true;
        //     const vectorLayer = new VectorLayer({
        //         source: vectorSource,
        //         style: new Style({
        //             fill: new Fill({
        //                 color: "rgba(0, 150, 136, 0.5)",
        //             }),
        //             stroke: new Stroke({
        //                 color: "#009688",
        //                 width: 2,
        //             }),
        //         }),
        //         zIndex: 5,
        //     });

        //     let drawInteraction = new Draw({
        //         source: vectorSource,
        //         type: "Polygon",
        //     });

        //     drawInteraction.on("drawend", (e) => {
        //         console.log(e.feature);
        //         mapStateRef.current.addLayer(vectorLayer);
        //         // drawnPolygonArrayRef.current.push(vectorLayer);
        //         drawnPolygonArrayRef.current.push({
        //             id: vectorLayer.getSource().ol_uid,
        //             vectorLayer,
        //         });
        //         mapStateRef.current.removeInteraction(drawInteraction);
        //         setDrawInteractionState(null);
        //         setIsDrawPolygonStateEnabled(false);
        //     });

        //     console.log(drawInteraction);

        //     mapStateRef.current.addInteraction(drawInteraction);
        //     setDrawInteractionState(drawInteraction);
        //     setIsDrawPolygonStateEnabled(true);
        // }

    }

    function drawPolyline(){

        if (drawInteractionState !== null && drawInteractionState.mode_ === "LineString") {
            mapStateRef.current.removeInteraction(drawInteractionState);
            setDrawInteractionState(null);
        } else {
            
            if(drawInteractionState){
                mapStateRef.current.removeInteraction(drawInteractionState);
                // setDrawInteractionState(null);
            }

            const vectorSource = new VectorSource();
            vectorSource["isADrawFeature"] = true;
            const vectorLayer = new VectorLayer({
                source: vectorSource,
                style: new Style({
                    fill: new Fill({
                        color: "rgba(0, 150, 136, 0.5)",
                    }),
                    stroke: new Stroke({
                        color: "#009688",
                        width: 10,
                    }),
                }),
                zIndex: 5,
            });

            let drawInteraction = new Draw({
                source: vectorSource,
                type: "LineString",
            });

            drawInteraction.on("drawend", (e) => {
                console.log(e.feature);
                e.feature["isADrawFeature"] = true;
                mapStateRef.current.addLayer(vectorLayer);
                // drawnPolygonArrayRef.current.push(vectorLayer);
                drawnPolygonArrayRef.current.push({
                    id: vectorLayer.getSource().ol_uid,
                    vectorLayer,
                });
                mapStateRef.current.removeInteraction(drawInteraction);
                setDrawInteractionState(null);
                // setIsDrawPolygonStateEnabled(false);
            });

            console.log(drawInteraction);

            mapStateRef.current.addInteraction(drawInteraction);
            setDrawInteractionState(drawInteraction);
            // setIsDrawPolygonStateEnabled(true);
        }
    }

    function drawPoint(){

        if (drawInteractionState !== null && drawInteractionState.mode_ === "Point") {
            mapStateRef.current.removeInteraction(drawInteractionState);
            setDrawInteractionState(null);
        } else {
            
            if(drawInteractionState){
                mapStateRef.current.removeInteraction(drawInteractionState);
                // setDrawInteractionState(null);
            }

            const vectorSource = new VectorSource();
            vectorSource["isADrawFeature"] = true;
            const vectorLayer = new VectorLayer({
                source: vectorSource,
                // style: new Style({
                //     fill: new Fill({
                //         color: "rgba(0, 150, 136, 0.5)",
                //     }),
                //     stroke: new Stroke({
                //         color: "#009688",
                //         width: 10,
                //     }),
                // }),
                style: new Style({
                    image: new CircleStyle({
                      radius: 10, // Size of the point
                      fill: new Fill({
                        color: 'rgba(255, 0, 0, 0.5)', // Red color with 50% opacity
                      }),
                      stroke: new Stroke({
                        color: 'red', // Red outline
                        width: 2,
                      }),
                    }),
                }),
                zIndex: 5,
            });

            let drawInteraction = new Draw({
                source: vectorSource,
                type: "Point",
            });

            drawInteraction.on("drawend", (e) => {
                console.log(e.feature);
                e.feature["isADrawFeature"] = true;
                mapStateRef.current.addLayer(vectorLayer);
                // drawnPolygonArrayRef.current.push(vectorLayer);
                drawnPolygonArrayRef.current.push({
                    id: vectorLayer.getSource().ol_uid,
                    vectorLayer,
                });
                mapStateRef.current.removeInteraction(drawInteraction);
                setDrawInteractionState(null);
                // setIsDrawPolygonStateEnabled(false);
            });

            console.log(drawInteraction);

            mapStateRef.current.addInteraction(drawInteraction);
            setDrawInteractionState(drawInteraction);
            // setIsDrawPolygonStateEnabled(true);
        }
    }

    // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


    // --------------------------------------------------------------------------- Trigger useEFfect start ---------------------------------------------------------------------------

    // this use effect will remove the modify interaction when we click on the map instead of the feature (geometry)

    useEffect(() => {
        if (triggerForRemovingModifyInteractionForNonFeatureClick) {
            if (modifyInteractionState) {
                mapStateRef.current.removeInteraction(modifyInteractionState);
                setModifyInteractionState(null);
            }
            setTriggerForRemovingModifyInteractionForNonFeatureClick(false);
        }
    }, [triggerForRemovingModifyInteractionForNonFeatureClick]);

    // this useEffect will add the drawn vector layer to an array (state variable) which will contain the ids of the drawn vector source and the objects of drawn vector layer

    // useEffect(()=>{

    //   if(triggerForAddingVectorLayerToDrawnLayerArray.triggerValue){

    //     let tempArray = [...drawnVectorLayersArray];

    //     tempArray.push({
    //       id: triggerForAddingVectorLayerToDrawnLayerArray.vectorLayer.getSource().ol_uid,
    //       vectorLayer: triggerForAddingVectorLayerToDrawnLayerArray.vectorLayer
    //     });

    //     setDrawnVectorLayersArray(tempArray);

    //     setTriggerForAddingVectorLayerToDrawnLayerArray({
    //       triggerValue: false,
    //       vectorLayer: null,
    //     })
    //   }

    // },[triggerForAddingVectorLayerToDrawnLayerArray])

    // this use effect will remove the modify interaction when we click on a feature which is not currently being edited

    useEffect(() => {
        if (triggerObjectForCheckingCurrentlyBeingEditedFeatureId.triggerState) {
            if (
                currentlyGettingEditedFeatureId &&
                currentlyGettingEditedFeatureId !==
                triggerObjectForCheckingCurrentlyBeingEditedFeatureId.feature.ol_uid
            ) {
                mapStateRef.current.removeInteraction(modifyInteractionState);
                setModifyInteractionState(null);
                setCurrentlyGettingEditedFeatureId(null);
            }

            setTriggerObjectForCheckingCurrentlyBeingEditedFeatureId({
                triggerState: false,
                feature: null,
            });
        }
    }, [triggerObjectForCheckingCurrentlyBeingEditedFeatureId]);

    // --------------------------------------------------------------------------- Trigger useEFfect end ---------------------------------------------------------------------------


    // -------------------------------------------------------------------------- Popup button function start --------------------------------------------------------------------------

    function handleIndividualFeatureEdit() {
       
        if(featurePopupOverlayState){
            // console.log();
            if(clickedVectorSource.getFeatures()[0].getGeometry().getType() === "Point"){
                featurePopupOverlayState.setPosition(null);
            }
        }

        // This 'if' block will add the id of the clicked geometry's vectorSource to an array (state variable) which will contain the id's of all the geometries which are edited till now and which are present on the map

        if (
            !editedFeatureIdArray.includes(
                clickedVectorSource.getFeatures()[0].ol_uid
            )
        ) {
            let tempArray = [...editedFeatureIdArray];
            tempArray.push(clickedVectorSource.getFeatures()[0].ol_uid);
            setEditedFeatureIdArray(tempArray);
        }

        // This will set the id of the currently being edited geometry's vectorSource id in the state variable 'currentlyGettingEditedFeatureId'

        setCurrentlyGettingEditedFeatureId(
            clickedVectorSource.getFeatures()[0].ol_uid
        );

        const modify = new Modify({
            source: clickedVectorSource,
        });

        mapStateRef.current.addInteraction(modify);

        setModifyInteractionState(modify);

        modify.on("modifyend", function (event) {
            // The event contains modified features
            const modifiedFeatures = event.features;

            // Loop through the modified features and log them or do something with them
            modifiedFeatures.forEach((feature) => { });
        });
    }

    function handleStopEdit() {
        if (modifyInteractionState) {
            mapStateRef.current.removeInteraction(modifyInteractionState);
            setModifyInteractionState(null);
            setCurrentlyGettingEditedFeatureId(null);
        }
    }

    function handleLayerAdition() { // Aiming to make it a Generic Function
        
        // This if block will check if the vector which we are aiming to add is in modify state or not, and if it is in the modify state then it will remove that state from the modify state, set the setModifyInteractionState to null and also set the setCurrentlyGettingEditedFeatureId to null

        if (
            currentlyGettingEditedFeatureId ===
            clickedVectorSource.getFeatures()[0].ol_uid &&
            modifyInteractionState
        ) {
            mapStateRef.current.removeInteraction(modifyInteractionState);
            setModifyInteractionState(null);
            setCurrentlyGettingEditedFeatureId(null);
        }

        // This will appropriately retrieve the object from the drawnPolygonArrayRef (array) which contains vector source id and vector layer of drawn geometry

        let tempObject = drawnPolygonArrayRef.current.find(
            (obj) => clickedVectorSource.ol_uid === obj.id
        );

        // This will retrive the coordinates of the drawn geometry for which the layer addition operation is being performed

        let coordinates = tempObject.vectorLayer
            .getSource()
            .getFeatures()[0]
            .getGeometry()
            .getCoordinates()[0]
            .map((coords) => {
                let latLongCoords = toLonLat(coords);
                // return toLonLat(coords);
                return {
                    lat: latLongCoords[1],
                    lng: latLongCoords[0],
                };
            });

        // After the submissionLayerCoordinates state variable is updated with the coordinates the modal will be popped on the screen using the useEffect in the 'MainDivComponent3'
        // setSubmissionLayerCoordinates(coordinates);

        // This will close the featurePopup which appeared on top of the drawn geometry
        featurePopupOverlayState.setPosition(null);
    }

    // This function will get triggered for the save edit button which will only appear on the geometry which is loaded using geoserver and on which we have clicked the edit button 

    

    function handleLayerEditSave() {    // Aiming to make it a Generic Function
        // console.log("Inside");
        // setShowMapLoader(true);

        // This if block will check if the vector which we are aiming to update is in modify state or not, and if it is in the modify state then it will remove that state from the modify state, set the setModifyInteractionState to null and also set the setCurrentlyGettingEditedFeatureId to null

        if (
            currentlyGettingEditedFeatureId ===
            clickedVectorSource.getFeatures()[0].ol_uid &&
            modifyInteractionState
        ) {
            mapStateRef.current.removeInteraction(modifyInteractionState);
            setModifyInteractionState(null);
            setCurrentlyGettingEditedFeatureId(null);
        }

        // This will retrive the coordinates of the edited geometry for which the layer edit save operation is being performed

        let coordinates = clickedVectorSource
            .getFeatures()[0]
            .getGeometry()
            .getCoordinates()[0]
            .map((coords) => {
                let latLongCoords = toLonLat(coords);
                return {
                    lat: latLongCoords[1],
                    lng: latLongCoords[0],
                };
            });

        // This will uniquely identify the object from the vectorLayerArrayState (state variable which cntain the geoserver id of the geometry and the vector Layer of the checked layer) and will utilize its geoserver id to update the geometry in the database using the geo server

        // let tempObject = vectorLayerArrayState.find((layerObject) => {
        //   return layerObject.vectorLayer
        //     .getSource()
        //     .getFeatures()
        //     .some((feature) => feature === clickedVectorSource.getFeatures()[0]);
        // });

        // let requestData = convertToGMLForLayerUpdationinGeoServer({
        //   id: tempObject.id,
        //   coordinates,
        // });

        // console.log("Code Reached Here");

        // fetch("http://localhost:9011/geoserver/wfs", {
        //   method: "POST",
        //   mode: "cors", // Adjust this if needed for CORS handling
        //   // headers: {
        //   //   'Accept': 'application/json',
        //   // }
        //   body: requestData,
        // })
        //   .then((response) => {
        //     if (!response.ok) {
        //       if (response.status === 401 || response.status === 403) {
        //         sessionStorage.removeItem("accessToken");
        //         sessionStorage.removeItem("username");
        //         sessionStorage.removeItem("department");
        //         sessionStorage.removeItem("gender");
        //         //   dispatch(removeAllLayer());
        //         // navigate('/login')
        //         window.location.href = "./login";
        //       }
        //       throw new Error(
        //         "Network response was not ok " + response.statusText
        //       );
        //     }
        //     return response.text(); // Parse the JSON response
        //   })
        //   .then((text) => {
        //     console.log("The Output: ");
        //     console.log(text);
        //     let tempArray3 = editedFeatureIdArray.filter(
        //       (item) => item !== clickedVectorSource.getFeatures()[0].ol_uid
        //     );
        //     setEditedFeatureIdArray(tempArray3);

        //     mapStateRef.current.removeLayer(tempObject.vectorLayer);
        //     featurePopupOverlayState.setPosition(null);

        //     let tempArray2 = vectorLayerArrayState.filter(
        //       (item) => tempObject.id !== item.id
        //     );
        //     setVectorLayerArrayState(tempArray2);

        //     let tempArray = administrativeLayerList.map((obj) => {
        //       if (obj.id === tempObject.id) {
        //         return {
        //           ...obj,
        //           isChecked: false,
        //         };
        //       }
        //       return obj;
        //     });

        //     setAdministrativeLayerList(tempArray);
        //     // setShowMapLoader(false);
        //   })
        //   .catch((error) => {
        //     console.error("Error fetching data:", error);
        //     featurePopupOverlayState.setPosition(null);
        //   });
    }

    // This function will get executed when we click on the REemove Layer button which will apear only on the drawn vectos

    // Generic Function

    function handleLayerRemoval() {
        let tempObject = drawnPolygonArrayRef.current.find(
            (obj) => obj.id === clickedVectorSource.ol_uid
        );
        mapStateRef.current.removeLayer(tempObject.vectorLayer);
        featurePopupOverlayState.setPosition(null);
    }

    // ------------------------------------------------------------------------------------- Popup button functions end -------------------------------------------------------------------------------------


    return (
        <div className="h-full w-full">
            <div
                ref={mapRef} // Attach the map to this div
                className="h-full w-full"
            />
            {/* <div
                className="feature-popup-conatiner ol-popup"
                id="feature-popup-id"
                style={{ display: "block" }}
                ref={featurePopupRef}
            >
                <h1>Varad</h1>
            </div> */}

            <div
                className="feature-popup-conatiner ol-popup"
                id="feature-popup-id"
                style={{ display: "block" }}
                ref={featurePopupRef}
            >
                <div className="feature-popup-topmost-section">
                    <button
                        className="feature-popup-close-btn"
                        onClick={() => {
                            console.log("close button clicked");
                            featurePopupOverlayState.setPosition(null);
                        }}
                    >
                        x
                    </button>
                </div>
                <div>
                    {clickedVectorSource &&
                        currentlyGettingEditedFeatureId ===
                        clickedVectorSource.getFeatures()[0].ol_uid ? (
                        <button className="feature-edit-btn" onClick={handleStopEdit}>
                            stop edit
                        </button>
                    ) : (
                        <button
                            className="feature-edit-btn"
                            onClick={handleIndividualFeatureEdit}
                        >
                            Edit
                        </button>
                    )}
                    {clickedVectorSource &&
                        !clickedVectorSource.isADrawFeature &&
                        editedFeatureIdArray.includes(
                            clickedVectorSource.getFeatures()[0].ol_uid
                        ) && (
                            <button
                                className="feature-edit-btn"
                                onClick={handleLayerEditSave}
                            >
                                save edit
                            </button>
                        )}
                    {clickedVectorSource && clickedVectorSource.isADrawFeature && (
                        <button className="feature-edit-btn" onClick={handleLayerAdition}>
                            Add Layer
                        </button>
                    )}
                    {clickedVectorSource && clickedVectorSource.isADrawFeature && (
                        <button className="feature-edit-btn"onClick={handleLayerRemoval}>
                            Remove Layer
                        </button>
                    )}
                </div>
            </div>

            {/* <div className='toolbar-container'>
                <button><FontAwesomeIcon icon="fa-solid fa-location-dot"/></button>
            </div> */}

            <div className="toolbar-container">
                <button
                    className="toolbar-button"
                    title="Measure Distance"
                    onClick={startMeasuringLinestringDistance}
                >
                    <FontAwesomeIcon icon={faRulerHorizontal} />
                </button>
                <button
                    className="toolbar-button"
                    title="Measure Area"
                    onClick={startMeasuringPolygonArea}
                >
                    <FontAwesomeIcon icon={faRulerCombined} />
                </button>
                <button
                    className="toolbar-button"
                    title="Draw Polygon"
                    onClick={drawPolygon}
                >
                    <FontAwesomeIcon icon={faDrawPolygon} />
                </button>
                <button
                    className="toolbar-button"
                    title="Draw Polyline"
                    onClick={drawPolyline}
                >
                    <FontAwesomeIcon icon={faLinesLeaning} />
                </button>
                <button
                    className="toolbar-button"
                    title="Draw Point"
                    onClick={drawPoint}
                >
                    <FontAwesomeIcon icon={faLocationDot} />
                </button>
                <button className="toolbar-button" title="Clear Map" onClick={clearMap}>
                    <FontAwesomeIcon icon={faTrashAlt} />
                </button>
                <button className="toolbar-button" title="Reset Map" onClick={resetMap}>
                    <FontAwesomeIcon icon={faHome} />
                </button>
                <button
                    className="toolbar-button"
                    title="State Testing Button"
                    onClick={() => {
                        console.log(drawnPolygonArrayRef.current);
                    }}
                >
                    <FontAwesomeIcon icon={faToolbox} />
                </button>
            </div>
        </div>
    );
}

export default MapComponent;
