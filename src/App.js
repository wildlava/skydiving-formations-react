import { useState, useEffect } from 'react';
import './App.css';

const delivery_api_token = process.env.REACT_APP_DELIVERY_API_TOKEN;
const space_id = process.env.REACT_APP_SPACE_ID;

function App() {
  const [formationSize, setFormationSize] = useState(8);
  const [formations, setFormations] = useState(null);
  const [curFormation, setCurFormation] = useState(0);

  useEffect(() => {
    const query = `
    {
      formationCollection(where: { size: ${formationSize} }, order: [code_ASC]) {
        items {
          name
          code
          diagram {
            url
          }
        }
      }
    }
    `;

    window
      .fetch(`https://graphql.contentful.com/content/v1/spaces/${space_id}/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${delivery_api_token}`,
        },
        body: JSON.stringify({ query }),
      })
      .then((response) => response.json())
      .then(({ data, errors }) => {
        if (errors) {
          console.error(errors);
        }

        setCurFormation(0); /* <-- This setter needs to be run first for now,
                                   but try running it second when React 18 arrives. */
        setFormations(data.formationCollection.items);
      });
  }, [formationSize]);

  if (!formations) {
    return "Loading from Contentful...";
  }

  return (
    <div className="App">
      <select defaultValue="8" onChange={e => setFormationSize(parseInt(e.target.value, 10))}>
        {[...Array(19).keys()].map((value, index) => (
          <option key={index} value={index+2}>{index+2}-way</option>
        ))}
      </select>
      <p>Number of formations: {formations.length}</p>
      <img src={formations[curFormation].diagram.url} className="App-diagram" alt="diagram" />
      <h2><p>{formations[curFormation].name}</p></h2>
      <p>{formations[curFormation].code}</p>
      <button disabled={curFormation <= 0} onClick={() => setCurFormation(curFormation - 1)}>-</button>
      <button disabled={curFormation >= (formations.length - 1)} onClick={() => setCurFormation(curFormation + 1)}>+</button>
    </div>
  );
}

export default App;
