import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import IndivdualLayerComponent from "./IndivdualLayerComponent";

function ToolbarComponent({vectorLayerArrayState, setVectorLayerArrayState, mapStateRef, vectorLayerArrayStateRef}) {
  
  const [activeAccordion, setActiveAccordion] = useState(null);

  const [backendLayerList, setBackendLayerList] = useState([]);

  useEffect(()=>{
    // fetch("http://localhost:8097/getGeoServerLayerNames", {
    //   method: 'GET', // Specify the HTTP method
    //   headers: {
    //     'Content-Type': 'application/json', // Specify the content type
    //     // 'Authorization':'Bearer '+sessionStorage.getItem('accessToken')
    //   },
    // })
    // .then(response => {
    //   if (!response.ok) {
    //     if(response.status == 401 || response.status == 403){
    //       sessionStorage.removeItem("accessToken");
    //       sessionStorage.removeItem("username");
    //       sessionStorage.removeItem("department");
    //       sessionStorage.removeItem("gender");
    //       // dispatch(removeAllLayer());
    //       // navigate('/login')
    //     }
    //     throw new Error('Network response was not ok ' + response.statusText);
    //   }
    //   return response.json(); // Parse the JSON response
    // })
    // .then(data => {
    //   let layerdata = data.map(obj=>{
    //     return{
    //       ...obj,
    //       isChecked: false,
    //     }
    //   }) 
    //   setBackendLayerList(layerdata);
    //   console.log('Success:', layerdata);
    // })
    // .catch(error => {
    //   console.error('Error:', error);
    // });
  },[]);

  const toggleAccordion = (index) => {
    setActiveAccordion(activeAccordion === index ? null : index);
  };
  return (
    <div className="border-2 p-1 bg-[#bc6b999e] rounded-tl-lg rounded-tr-lg">
      <h1 className="text-2xl font-bold text-center bg-[#DE00FF] mb-2 rounded-tl-lg rounded-tr-lg">
        Table Of Content
      </h1>

      {/* Accordion 1 */}
      <div className="border mb-2">
        <button
          className="w-full flex justify-between items-center p-1 font-bold bg-gray-200"
          onClick={() => toggleAccordion(1)}
        >
          Layers
          <FontAwesomeIcon
            icon={activeAccordion === 1 ? faChevronUp : faChevronDown}
          />
        </button>
        {activeAccordion === 1 && (
          <div className="p-2">
            {
              backendLayerList.map( 
                (individualComponent) => <IndivdualLayerComponent key={individualComponent.id} individualComponent={individualComponent} backendLayerList={backendLayerList} setBackendLayerList={setBackendLayerList} vectorLayerArrayState={vectorLayerArrayState} setVectorLayerArrayState={setVectorLayerArrayState} vectorLayerArrayStateRef={vectorLayerArrayStateRef} mapStateRef={mapStateRef}/> 
              )
            }

          </div>
        )}
      </div>

      {/* Accordion 2 */}
      <div className="border mb-2">
        <button
          className="w-full flex justify-between items-center p-1 font-bold bg-gray-200"
          onClick={() => toggleAccordion(2)}
        >
          Other
          <FontAwesomeIcon
            icon={activeAccordion === 2 ? faChevronUp : faChevronDown}
          />
        </button>
        {activeAccordion === 2 && (
          <div className="p-2">
            <p>
              This is some text inside Accordion 2. You can add more detailed
              content here.
            </p>
          </div>
        )}
      </div>

      {/* Accordion 3 */}
      <div className="border mb-2">
        <button
          className="w-full flex justify-between items-center p-1 font-bold bg-gray-200"
          onClick={() => toggleAccordion(3)}
        >
          Others
          <FontAwesomeIcon
            icon={activeAccordion === 3 ? faChevronUp : faChevronDown}
          />
        </button>
        {activeAccordion === 3 && (
          <div className="p-2">
            <p>
              This is some text inside Accordion 3. You can add more detailed
              content here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ToolbarComponent;
