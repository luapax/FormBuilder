import './App.scss';
import { Home } from './views/Home';

const main = document.querySelector('main');
main.innerHTML = 'Form Builder';
main.append(Home())
    ;
