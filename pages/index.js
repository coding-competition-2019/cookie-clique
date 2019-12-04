import React from 'react';
import {
  Stack,
  Button,
  Heading,
  Text,
  InputField,
  Tile,
  Badge,
} from '@kiwicom/orbit-components';
import styled, { css } from 'styled-components';
import mq from '@kiwicom/orbit-components/lib/utils/mediaQuery';
import { StyledCardSectionContent } from '@kiwicom/orbit-components/lib/Card/CardSection/CardSectionContent';

import {
  findAllLimit,
  searchCatBySubstring,
  getClosestPointsWithFilters,
} from '../mock_database';

import mbxGeocoding from '@mapbox/mapbox-sdk/services/geocoding';
const geocodingClient = mbxGeocoding({
  accessToken:
    'pk.eyJ1IjoiZGhubSIsImEiOiJjazNyOXplMTIwOWNpM21xY25vNHk1YnNpIn0.ugxD1-LZgv7Sw0aFa5vXpw',
});

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  max-width: 600px;
  margin: 0 auto;
  font-family: 'Roboto', sans-serif;
`;

const InputWrapper = styled.div`
  background-color: white;
  display: block;
  flex: 0 1;
  width: 100%;
  box-sizing: border-box;
  margin: 0;
  padding: ${({ theme }) =>
    `${theme.orbit.spaceMedium} ${theme.orbit.spaceSmall}`};
`;

const MapWrapper = styled.div`
  display: block;
  flex: 1 0 100%;
  width: 100%;
  height: 100px;
  box-sizing: border-box;
  background-color: #edf2f7;
  overflow-y: auto;
  padding: ${({ theme }) =>
    `${theme.orbit.spaceXXLarge} ${theme.orbit.spaceMedium} 90px ${theme.orbit.spaceMedium}`};

  ${StyledCardSectionContent} {
    margin: 0 -24px;
    padding-top: 0;
  }
`;

const Img = styled.img`
  flex: 1 1;
  width: 100%;
  height: 100%;
`;

const StyledPlaceCard = styled.a`
  width: 100%;
  display: flex;
  box-sizing: border-box;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  background-color: ${({ theme }) => theme.orbit.paletteWhite};
  padding: ${({ theme }) =>
    `${theme.orbit.spaceMedium} ${theme.orbit.spaceLarge}`};
  border-radius: ${({ theme }) => theme.orbit.borderRadiusNormal};
  border-bottom: 1px solid ${({ theme }) => theme.orbit.paletteCloudLight};
  box-shadow: ${({ theme }) => theme.orbit.boxShadowAction};
  border-radius: ${({ theme }) => theme.orbit.borderRadiusNormal};

  text-decoration: none;
`;

const InputAutoContainer = styled.div`
  position: relative;
`;

const AutoCompleteWrapper = styled.div`
  border-radius: 3px;
  position: absolute;
  box-shadow: 0 4px 12px 0 rgba(23, 27, 30, 0.3);
  background-color: #fff;
  z-index: 9;
`;

const BadgeWrapper = styled.span`
  cursor: pointer;
  margin: 2px 4px;
`;

const Autocomplete = ({
  searchValue,
  addCat,
  setSearchValue,
  selectedCats,
}) => {
  const suggestedCats = searchCatBySubstring(
    searchValue.trim().toLowerCase(),
    null,
    selectedCats,
  );
  if (!suggestedCats.length) {
    return <div>Nothing found!</div>;
  }
  return suggestedCats.map((cat, i) => (
    <Tile
      title={cat}
      key={cat}
      description={i ? null : <em>Tap on the activity to add it</em>}
      onClick={() => {
        setSearchValue('');
        addCat(cat);
      }}
    />
  ));
};

export default () => {
  const [results, setResults] = React.useState([]);
  const [searchValue, setSearchValue] = React.useState('');
  const [selectedCats, setSelectedCats] = React.useState([]);
  const [distanceLimit, setDistanceLimit] = React.useState(40);
  React.useEffect(() => {
    const storedCats = localStorage.getItem('selectedCats');
    if (storedCats) {
      setSelectedCats(JSON.parse(storedCats));
    }
  }, []);
  React.useEffect(() => {
    localStorage.setItem('selectedCats', JSON.stringify(selectedCats));
  }, [selectedCats.length]);

  const addCat = (catToAdd) => {
    setSelectedCats([catToAdd, ...selectedCats]);
  };

  const removeCat = (catToRemove) => {
    const newCats = selectedCats.filter((e) => e !== catToRemove);
    setSelectedCats(newCats);
  };

  const distanceLimitRef = React.useRef(null);

  const applyFilters = (limit) => {
    if (!limit) {
      limit = 10;
    }

    navigator.geolocation.getCurrentPosition(function(position) {
      const userCoords = [position.coords.latitude, position.coords.longitude];

      setResults(
        getClosestPointsWithFilters(
          userCoords,
          parseInt(distanceLimitRef.current.value),
          selectedCats,
          limit,
        ),
      );
    });
  };

  return (
    <Wrapper>
      <Stack direction="column" spacing="none">
        <InputWrapper>
          <InputAutoContainer>
            <InputField
              label="Type & select activity"
              placeholder="Eg. fitness"
              inputMode="search"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
            <AutoCompleteWrapper>
              {searchValue ? (
                <Autocomplete
                  searchValue={searchValue}
                  addCat={addCat}
                  setSearchValue={setSearchValue}
                  selectedCats={selectedCats}
                />
              ) : null}
            </AutoCompleteWrapper>
          </InputAutoContainer>
          <div>
            Activities:{' '}
            {!selectedCats.length
              ? 'Please, type and select activity'
              : selectedCats.map((cat) => (
                  <BadgeWrapper onClick={() => removeCat(cat)}>
                    <Badge type="info">{cat}</Badge>
                  </BadgeWrapper>
                ))}{' '}
            <br />
          </div>
          Distance (km):{' '}
          <input type="number" defaultValue={40} ref={distanceLimitRef} />
          <Button onClick={() => applyFilters()}>Search</Button>
        </InputWrapper>
        <MapWrapper>
          <Heading type="title2" spaceAfter="medium">
            Results
          </Heading>
          <Stack direction="column">
            {results.map((place, i) => (
              <StyledPlaceCard
                key={place.name + i}
                href={place.url}
                target="_blank"
              >
                <Stack spacing="extraTight">
                  <Heading type="title3">{place.name}</Heading>
                  <br />
                  <Text type="secondary" element="div">
                    <em>{place.activities.join(', ')}</em>
                  </Text>
                  <br />
                  <Text type="primary" element="div">
                    {place.address.street}, {place.address.city}
                  </Text>
                  <Text type="info" element="div" size="small">
                    {Math.round(place.distance)} km from your location
                  </Text>
                </Stack>
              </StyledPlaceCard>
            ))}
          </Stack>
        </MapWrapper>
        {/* <Footer
          leftActions={
            <ButtonLink
              type="secondary"
              icon={<Share />}
              onClick={() => setVisibleShareModal(true)}
            >
              Share
            </ButtonLink>
          }
          rightActions={
            <Stack direction="row" justify="end" shrink>
              <Button
                href={`https://www.kiwi.com/en/booking?token=${
                  query.bookingToken
                }`}
                external
                iconLeft={<Kiwicom />}
              >
                Book the flight
              </Button>
            </Stack>
          }
        /> */}
        {/* {isVisibleShareModal && (
          <ShareModal onClose={setVisibleShareModal} />
        )} */}
      </Stack>
    </Wrapper>
  );
};
