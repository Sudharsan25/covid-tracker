import React, { useState, useEffect } from "react";
import {
  FormControl,
  Select,
  MenuItem,
  Card,
  CardContent,
} from "@material-ui/core";
import "./App.css";
import InfoBox from "./Components/InfoBox";
import Map from "./Components/Map";
import Table from "./Components/Table";
import { prettyPrintStat, sortData } from "./util";
import LineGraph from "./Components/LineGraph";
import "leaflet/dist/leaflet.css";

function App() {
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState("worldwide");
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);
  const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796 });
  const [mapZoom, setMapZoom] = useState(3);
  const [casesType, setCasesType] = useState("cases");
  const [mapCountries, setMapCountries] = useState([]);
  const [countryCod, setCountryCod] = useState("worldwide");
  //"https://disease.sh/v3/covid-19/countries"
  useEffect(() => {
    fetch("https://disease.sh/v3/covid-19/all")
      .then((response) => response.json())
      .then((data) => {
        setCountryInfo(data);
      });
  }, []);

  useEffect(() => {
    const getCountriesData = async () => {
      await fetch("https://disease.sh/v3/covid-19/countries")
        .then((response) => response.json())
        .then((data) => {
          const countries = data.map((country) => ({
            name: country.country,
            value: country.countryInfo.iso2,
          }));
          let sortedData = sortData(data);
          setTableData(sortedData);
          setMapCountries(data);
          setCountries(countries);
        });
    };

    getCountriesData();
  }, []);

  const onCountryChange = async (event) => {
    const countryCode = event.target.value;
    setCountryCod(countryCode);
    const url =
      countryCode === "worldwide"
        ? "https://disease.sh/v3/covid-19/all"
        : `https://disease.sh/v3/covid-19/countries/${countryCode}?strict=true`;

    await fetch(url)
      .then((response) => response.json())
      .then((data) => {
        setCountry(countryCode);
        setCountryInfo(data);
        console.log(data);
        countryCode === "worldwide"
          ? setMapCenter({ lat: 34.80746, lng: -40.4796 })
          : setMapCenter([data.countryInfo.lat, data.countryInfo.long]);

        countryCode === "worldwide" ? setMapZoom(3) : setMapZoom(5);
      });
  };

  return (
    <div className="app">
      <div className="app__left">
        <div className="app__header">
          <h1>COVID-19 TRACKER</h1>
          <FormControl className="app__dropdown">
            <Select
              variant="outlined"
              value={country}
              onChange={onCountryChange}
            >
              <MenuItem value="worldwide">Worldwide</MenuItem>
              {countries.map((country) => (
                <MenuItem value={country.value}>{country.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        <div className="app__stats">
          <InfoBox
            active={casesType === "cases"}
            isRed
            onClick={(e) => setCasesType("cases")}
            title={`Covid Cases ${
              countryCod === "worldwide" ? "Today" : "(per Million)"
            }`}
            cases={prettyPrintStat(countryInfo.casesPerOneMillion)}
            total={prettyPrintStat(countryInfo.cases)}
          />
          <InfoBox
            active={casesType === "recovered"}
            onClick={(e) => setCasesType("recovered")}
            title={`Recovered ${
              countryCod === "worldwide" ? "Today" : "(per Million)"
            }`}
            cases={prettyPrintStat(countryInfo.recoveredPerOneMillion)}
            total={prettyPrintStat(countryInfo.recovered)}
          />
          <InfoBox
            active={casesType === "deaths"}
            isRed
            onClick={(e) => setCasesType("deaths")}
            title={`Deaths ${
              countryCod === "worldwide" ? "Today" : "(per Million)"
            }`}
            cases={prettyPrintStat(countryInfo.deathsPerOneMillion)}
            total={prettyPrintStat(countryInfo.deaths)}
          />
        </div>
        <Map
          casesType={casesType}
          countries={mapCountries}
          center={mapCenter}
          zoom={mapZoom}
        />
      </div>
      <div className="app__spacer"></div>
      <Card className="app__right">
        <CardContent className="app__information">
          <h3>Live cases by country</h3>
          <Table countries={tableData} />
          <h3>Worldwide recent {casesType}</h3>
          <LineGraph className="app__graph" casesType={casesType} />
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
