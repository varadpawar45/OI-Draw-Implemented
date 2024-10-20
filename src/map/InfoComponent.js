// import React, { useState } from "react";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";

// // 34eb99  #37eb34   2fb3f5  d7eefa  dff7f7
// function InfoComponent() {

//   const [activeAccordion, setActiveAccordion] = useState(null);

  

//   const toggleAccordion = (index) => {
//     setActiveAccordion(activeAccordion === index ? null : index);
//   };

//   return (
//     <div className="border-2 p-1 bg-[#f0fcf6] rounded-tl-lg rounded-tr-lg">
//       <h1 className="text-2xl font-bold text-center bg-[#34eb99] mb-2 rounded-tl-lg rounded-tr-lg">
//         Attribute Information
//       </h1>

//       {/* Accordion 1 */}
//       <div className="border mb-2">
//         <button
//           className="w-full flex justify-between items-center p-1 font-bold bg-gray-200"
//           onClick={() => toggleAccordion(1)}
//         >
//           Graph Visualization
//           <FontAwesomeIcon
//             icon={activeAccordion === 1 ? faChevronUp : faChevronDown}
//           />
//         </button>
//         {activeAccordion === 1 && (
//           <div className="p-2">
//             <p>
//               This is some text inside Accordion 1. You can add more detailed
//               content here.
//             </p>
//           </div>
//         )}
//       </div>

//       {/* Accordion 2 */}
//       <div className="border mb-2">
//         <button
//           className="w-full flex justify-between items-center p-1 font-bold bg-gray-200"
//           onClick={() => toggleAccordion(2)}
//         >
//           Table Visualization
//           <FontAwesomeIcon
//             icon={activeAccordion === 2 ? faChevronUp : faChevronDown}
//           />
//         </button>
//         {activeAccordion === 2 && (
//           <div className="p-2">
//             <p>
//               This is some text inside Accordion 2. You can add more detailed
//               content here.
//             </p>
//           </div>
//         )}
//       </div>

//       {/* Accordion 3 */}
//       <div className="border mb-2">
//         <button
//           className="w-full flex justify-between items-center p-1 font-bold bg-gray-200"
//           onClick={() => toggleAccordion(3)}
//         >
//           Accordion 3
//           <FontAwesomeIcon
//             icon={activeAccordion === 3 ? faChevronUp : faChevronDown}
//           />
//         </button>
//         {activeAccordion === 3 && (
//           <div className="p-2">
//             <p>
//               This is some text inside Accordion 3. You can add more detailed
//               content here.
//             </p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default InfoComponent;


import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
// import { useTable } from '@tanstack/react-table';
import DataTable from 'react-data-table-component';


const ExpandedComponent = ({ data }) => <pre>{JSON.stringify(data, null, 2)}</pre>;

const jsonData = [
  {
    "id": 1,
    "name": "Tiger Nixon",
    "position": "System Architect",
    "office": "Edinburgh",
    "age": 61,
    "startDate": "2011/04/25",
    "salary": "$320,800",
    "city": "Pune"
  },
  {
    "id": 2,
    "name": "Garrett Winters",
    "position": "Accountant",
    "office": "Tokyo",
    "age": 63,
    "startDate": "2011/07/25",
    "salary": "$170,750",
    "city": "Pune"
  },
  {
    "id": 3,
    "name": "Ashton Cox",
    "position": "Junior Technical Author",
    "office": "San Francisco",
    "age": 66,
    "startDate": "2009/01/12",
    "salary": "$86,000",
    "city": "Pune"
  },
  {
    "id": 4,
    "name": "Cedric Kelly",
    "position": "Senior Javascript Developer",
    "office": "Edinburgh",
    "age": 22,
    "startDate": "2012/03/29",
    "salary": "$433,060",
    "city": "Pune"
  },
  {
    "id": 5,
    "name": "Airi Satou",
    "position": "Accountant",
    "office": "Tokyo",
    "age": 33,
    "startDate": "2008/11/28",
    "salary": "$162,700",
    "city": "Pune"
  },
  {
    "id": 6,
    "name": "Brielle Williamson",
    "position": "Integration Specialist",
    "office": "New York",
    "age": 61,
    "startDate": "2012/12/02",
    "salary": "$372,000",
    "city": "Pune"
  },
  {
    "id": 7,
    "name": "Herrod Chandler",
    "position": "Sales Assistant",
    "office": "San Francisco",
    "age": 59,
    "startDate": "2012/08/06",
    "salary": "$137,500",
    "city": "Pune"
  },
  {
    "id": 8,
    "name": "Rhona Davidson",
    "position": "Integration Specialist",
    "office": "Tokyo",
    "age": 55,
    "startDate": "2010/10/14",
    "salary": "$327,900",
    "city": "Pune"
  },
  {
    "id": 9,
    "name": "Colleen Hurst",
    "position": "Javascript Developer",
    "office": "San Francisco",
    "age": 39,
    "startDate": "2009/09/15",
    "salary": "$205,500",
    "city": "Pune"
  },
  {
    "id": 10,
    "name": "Sonya Frost",
    "position": "Software Engineer",
    "office": "Edinburgh",
    "age": 23,
    "startDate": "2008/12/13",
    "salary": "$103,600",
    "city": "Pune"
  },
  {
    "id": 11,
    "name": "Sheru Nixon",
    "position": "System Architect",
    "office": "Edinburgh",
    "age": 61,
    "startDate": "2011/04/25",
    "salary": "$320,800",
    "city": "Pune"
  },
  {
    "id": 12,
    "name": "Gargi Winters",
    "position": "Accountant",
    "office": "Tokyo",
    "age": 63,
    "startDate": "2011/07/25",
    "salary": "$170,750",
    "city": "Pune"
  },
  {
    "id": 13,
    "name": "Ashutosh Cox",
    "position": "Junior Technical Author",
    "office": "San Francisco",
    "age": 66,
    "startDate": "2009/01/12",
    "salary": "$86,000",
    "city": "Pune"
  },
  {
    "id": 14,
    "name": "Fedric Kelly",
    "position": "Senior Javascript Developer",
    "office": "Edinburgh",
    "age": 22,
    "startDate": "2012/03/29",
    "salary": "$433,060",
    "city": "Pune"
  },
  {
    "id": 15,
    "name": "Aarti Satou",
    "position": "Accountant",
    "office": "Tokyo",
    "age": 33,
    "startDate": "2008/11/28",
    "salary": "$162,700",
    "city": "Pune"
  },
  {
    "id": 16,
    "name": "Birbal Williamson",
    "position": "Integration Specialist",
    "office": "New York",
    "age": 61,
    "startDate": "2012/12/02",
    "salary": "$372,000",
    "city": "Pune"
  },
  {
    "id": 17,
    "name": "Harish Chandler",
    "position": "Sales Assistant",
    "office": "San Francisco",
    "age": 59,
    "startDate": "2012/08/06",
    "salary": "$137,500",
    "city": "Pune"
  },
  {
    "id": 18,
    "name": "ROhan Davidson",
    "position": "Integration Specialist",
    "office": "Tokyo",
    "age": 55,
    "startDate": "2010/10/14",
    "salary": "$327,900",
    "city": "Pune"
  },
  {
    "id": 19,
    "name": "Colleem Hurst",
    "position": "Javascript Developer",
    "office": "San Francisco",
    "age": 39,
    "startDate": "2009/09/15",
    "salary": "$205,500",
    "city": "Pune"
  },
  {
    "id": 20,
    "name": "Sonyam Frost",
    "position": "Software Engineer",
    "office": "Edinburgh",
    "age": 23,
    "startDate": "2008/12/13",
    "salary": "$103,600",
    "city": "Pune"
  }
]

// 34eb99  #37eb34   2fb3f5  d7eefa  dff7f7
function InfoComponent() {
  const [activeAccordion, setActiveAccordion] = useState(null);

  const toggleAccordion = (index) => {
    setActiveAccordion(activeAccordion === index ? null : index);
  };

  const graphData = [
    { name: 'Page A', uv: 4000, pv: 2400, amt: 2400 },
    { name: 'Page B', uv: 3000, pv: 1398, amt: 2210 },
    { name: 'Page C', uv: 2000, pv: 9800, amt: 2290 },
    { name: 'Page D', uv: 2780, pv: 3908, amt: 2000 },
    { name: 'Page E', uv: 1890, pv: 4800, amt: 2181 },
    { name: 'Page F', uv: 2390, pv: 3800, amt: 2500 },
    { name: 'Page G', uv: 3490, pv: 4300, amt: 2100 },
  ];

  const [searchText, setSearchText] = useState('');

  const handleSearch = (event) => {
    setSearchText(event.target.value);
  };
  

  const [data, setData] = useState([]);

  useEffect(() => {
    // In a real application, you'd fetch the data from an API
    // For now, we'll use the JSON data directly
    setData(jsonData);
  }, []);


  // Define the table columns
  const columns = [
    {
      name: 'Name',
      selector: row => row.name,
      sortable: true,
    },
    {
      name: 'Position',
      selector: row => row.position,
      sortable: true,
    },
    {
      name: 'Office',
      selector: row => row.office,
      sortable: true,
    },
    {
      name: 'Age',
      selector: row => row.age,
      sortable: true,
    },
    {
      name: 'Start Date',
      selector: row => row.startDate,
      sortable: true,
    },
    {
      name: 'Salary',
      selector: row => row.salary,
      sortable: true,
    },
    {
      name: 'City',
      selector: row => row.city,
      sortable: true,
    }
  ];

  const filteredData = data.filter(item =>
    item.name.toLowerCase().includes(searchText.toLowerCase()) ||
    item.position.toLowerCase().includes(searchText.toLowerCase()) ||
    item.office.toLowerCase().includes(searchText.toLowerCase())
  );

  


  return (
    <div className="border-2 p-1 bg-[#f0fcf6] rounded-tl-lg rounded-tr-lg">
      <h1 className="text-2xl font-bold text-center bg-[#34eb99] mb-2 rounded-tl-lg rounded-tr-lg">Attribute Information</h1>

      {/* Accordion 1 */}
      <div className="border mb-2">
        <button
          className="w-full flex justify-between items-center p-1 font-bold bg-gray-200"
          onClick={() => toggleAccordion(1)}
        >
          Graph Visualization
          <FontAwesomeIcon icon={activeAccordion === 1 ? faChevronUp : faChevronDown} />
        </button>
        {activeAccordion === 1 && (
          <div className="p-2">
            {/* <p>This is some text inside Accordion 1. You can add more detailed content here.</p> */}
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={graphData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="pv" stroke="#8884d8" />
                <Line type="monotone" dataKey="uv" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Accordion 2 */}
      <div className="border mb-2">
        <button
          className="w-full flex justify-between items-center p-1 font-bold bg-gray-200"
          onClick={() => toggleAccordion(2)}
        >
          Table Visualization
          <FontAwesomeIcon icon={activeAccordion === 2 ? faChevronUp : faChevronDown} />
        </button>
        {activeAccordion === 2 && (
          <div className="p-2">
            {/* <DataTable
              columns={columns}
              data={filteredData} // Use filtered data for the table
              pagination
              highlightOnHover
              customStyles={{
                table:{
                  style:{
                    // backgroundColor: "red"
                  }
                },
                subHeader:{
                  style:{
                    minHeight: 0,
                  }
                },
                selectedRow: {
                  style: {
                    // backgroundColor: '#d1e7dd',
                    backgroundColor: 'red',
                    color: '#000',             
                    fontWeight: 'bold',
                  },
                },
                headCells: {
                  style: {
                    color: 'white',
                    fontWeight: 'bold',
                    borderRight: "1px solid #c1c1c1"
                  },
                },
                headRow:{ 
                  style: {
                    // height: '32px',
                    // backgroundColor: '#007bff',
                    backgroundColor: '#1f2937',
                    minHeight: "32px",
                  }
                },
                cells: {
                  style: {
                    height: '32px',
                    // padding: "0.25rem",
                    // padding: '10px',
                    borderBottom: '1px solid #ccc',
                  },
                },
                rows: {
                  style: {
                    // padding: "0.25rem",
                    height: '32px',
                    minHeight: "32px",
                  },
                  // style?: CSSObject;
                  selectedHighlightStyle: {
                    backgroundColor: "red"
                  }
                  // denseStyle?: CSSObject;
                  // highlightOnHoverStyle?: CSSObject;
                  // stripedStyle?: CSSObject;
                },
              }}
              subHeader
              subHeaderComponent={
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchText}
                  onChange={handleSearch}
                  style={{padding: '5px', width: '300px', fontSize: "12px", border:"1px solid lightgray"}}
                />
              }
              selectableRows
              selectableRowsHighlight
              expandableRows
			        expandableRowsComponent={ExpandedComponent}
              responsive   
            /> */}

            <DataTable
              columns={columns}
              data={filteredData} // Use filtered data for the table
              pagination
              highlightOnHover
              selectableRows
              selectableRowsHighlight // Enables highlight for selected rows
              customStyles={{
                table: {
                  style: {
                    // Add table specific styles here if needed
                  },
                },
                subHeader: {
                  style: {
                    minHeight: 0,
                  },
                },
                selectedRow: {
                  style: {
                    backgroundColor: 'red !important', // Custom background color for selected rows
                    color: '#000',
                    fontWeight: 'bold',
                  },
                },
                headCells: {
                  style: {
                    color: 'white',
                    fontWeight: 'bold',
                    borderRight: "1px solid #c1c1c1",
                  },
                },
                headRow: {
                  style: {
                    backgroundColor: '#1f2937',
                    minHeight: "32px",
                  },
                },
                cells: {
                  style: {
                    height: '32px',
                    borderBottom: '1px solid #ccc',
                  },
                },
                rows: {
                  style: {
                    height: '32px',
                    minHeight: "32px",
                  },
                  // Remove selectedHighlightStyle to avoid conflicts
                },
              }}
              subHeader
              subHeaderComponent={
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchText}
                  onChange={handleSearch}
                  style={{ padding: '5px', width: '300px', fontSize: "12px", border: "1px solid lightgray" }}
                />
              }
              expandableRows
              expandableRowsComponent={<div>Expanded Content</div>} // Adjust as needed
              responsive
            />

          </div>
        )}
      </div>

      {/* Accordion 3 */}
      <div className="border mb-2">
        <button
          className="w-full flex justify-between items-center p-1 font-bold bg-gray-200"
          onClick={() => toggleAccordion(3)}
        >
          Accordion 3
          <FontAwesomeIcon icon={activeAccordion === 3 ? faChevronUp : faChevronDown} />
        </button>
        {activeAccordion === 3 && (
          <div className="p-2">
            <p>This is some text inside Accordion 3. You can add more detailed content here.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default InfoComponent;