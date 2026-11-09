import { Country, CountryStateCityData } from '../typing'

const Data: CountryStateCityData = {
  countries: require('./countries.json'),
  details: {
    [Country.NG]: {
      states: require('./ng/states.json'),
      cities: require('./ng/cities').default,
    },
  },
}

export default Data
