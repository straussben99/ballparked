import { Stadium } from './stadium';

export interface HistoricStadium extends Stadium {
  yearClosed: number;
  currentStatus: string;
  formerTeam?: string;
}
