import { DataFrame, Labels, FieldConfig } from '@grafana/data';

/**
 * the raw channel events are batches of Measurements
 *
 * @experimental
 */
export interface Measurement {
  name: string;
  time?: number; // Missing will use the browser time
  values: Record<string, any>;
  config?: Record<string, FieldConfig>;
  labels?: Labels;
}

/**
 * @experimental
 */
export enum MeasurmentAction {
  /** The measurments will be added to the client buffer */
  Append = 'append',

  /** The measurments will replace the client buffer  */
  Replace = 'replace',

  /** All measurments will be removed from the client buffer before processing */
  Clear = 'clear',
}

/**
 * List of Measurements sent in a batch
 *
 * @experimental
 */
export interface MeasurementBatch {
  /**
   * The default action is to append values to the client buffer
   */
  action?: MeasurmentAction;

  /**
   * List of measurments to process
   */
  measures: Measurement[];

  /**
   * This will set the capacity on the client buffer for everything
   * in the measurment channel
   */
  capacity?: number;
}

export interface MeasurementsQuery {
  name?: string;
  labels?: Labels;
  fields?: string[]; // only include the fields with these names
}

/**
 * Channels that receive Measurements can collect them into frames
 *
 * @experimental
 */
export interface LiveMeasurements {
  getData(query?: MeasurementsQuery): DataFrame[];
  getDistinctNames(): string[];
  getDistinctLabels(name: string): Labels[];
  setCapacity(size: number): void;
  getCapacity(): number;
}
