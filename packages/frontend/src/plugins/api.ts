import aspida from '@aspida/axios';
import api from 'api';
import axios from '@/plugins/axios';

const client = api(aspida(axios));

export default client;