import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HeaderComponent from "./layout/HeaderComponent";
import MapComponent from "./map/MapComponent";
import OtherComponent from "./map/OtherComponent";
import InfoComponent from "./map/InfoComponent";
import ToolbarComponent from "./map/ToolbarComponent";
import React, { useEffect, useState, useRef } from 'react';
import distanceIcon from './icons/distance.png';
import areaIcon from './icons/wide.png';

function App() {

  let mapStateRef = useRef(null);
  let [vectorLayerArrayState, setVectorLayerArrayState] = useState([]);
  let vectorLayerArrayStateRef = useRef([]); 

  console.log("App.js Rerendered");
  

  return (
    <Router>
      <div className="relative h-screen w-screen">
        {/* Conditionally render the header */}
        <Routes>
          <Route
            // path="/map"
            path="/"
            element={
              <>
                {/* Render only the bar icon */}
                <HeaderComponent isMapPage={true} />
                <MapComponent mapStateRef={mapStateRef}/>
                {/* <div className="absolute z-5 top-0 right-0 p-[10px_8px] flex flex-col gap-2">
                  <button className="">
                    <img src={distanceIcon} style={{width:"40px", backgroundColor:"light-grey", border:"2px solid grey", borderRadius:"5px%", padding: "3px", backgroundColor:"white"}}/>
                  </button>
                  <button className="">
                    <img src={areaIcon} style={{width:"40px", backgroundColor:"light-grey", border:"2px solid grey", borderRadius:"5px%", padding: "3px", backgroundColor:"white"}}/>
                  </button>
                </div> */}
                <div className="absolute top-0 right-0 w-2/5 h-full bg-white flex flex-col p-2 box-border z-10 hidden">
                  <InfoComponent />
                </div>
                <div className="absolute top-0 left-0 w-1/5 h-full bg-white flex flex-col p-2 box-border z-10 hidden">
                  <ToolbarComponent vectorLayerArrayState={vectorLayerArrayState} setVectorLayerArrayState={setVectorLayerArrayState} vectorLayerArrayStateRef={vectorLayerArrayStateRef} mapStateRef={mapStateRef}/>
                </div>
              </>
            }
          />
          <Route
            path="/other"
            element={
              <>
                {/* Render full header with white background */}
                <HeaderComponent isMapPage={false} />
                <OtherComponent />
              </>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;





