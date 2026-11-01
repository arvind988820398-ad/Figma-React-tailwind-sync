// The 12 people of the Figma "Avatar" set (User property), 128px photos exported from Figma for stories and demos.
import bonnieGreen from './bonnie-green.jpg';
import heleneEngels from './helene-engels.jpg';
import jeseLeos from './jese-leos.jpg';
import josephMcfall from './joseph-mcfall.jpg';
import karenNelson from './karen-nelson.jpg';
import lanaByrd from './lana-byrd.jpg';
import leslieLivingston from './leslie-livingston.jpg';
import michealGough from './micheal-gough.jpg';
import neilSims from './neil-sims.jpg';
import robertBrown from './robert-brown.jpg';
import robertaCasas from './roberta-casas.jpg';
import thomasLean from './thomas-lean.jpg';

export interface FigmaUser { name: string; src: string }

/** In the Figma User order. */
export const figmaUsers: FigmaUser[] = [
  { name: 'Jese Leos', src: jeseLeos },
  { name: 'Bonnie Green', src: bonnieGreen },
  { name: 'Roberta Casas', src: robertaCasas },
  { name: 'Neil Sims', src: neilSims },
  { name: 'Thomas Lean', src: thomasLean },
  { name: 'Micheal Gough', src: michealGough },
  { name: 'Helene Engels', src: heleneEngels },
  { name: 'Lana Byrd', src: lanaByrd },
  { name: 'Leslie Livingston', src: leslieLivingston },
  { name: 'Karen Nelson', src: karenNelson },
  { name: 'Robert Brown', src: robertBrown },
  { name: 'Joseph McFall', src: josephMcfall },
];
