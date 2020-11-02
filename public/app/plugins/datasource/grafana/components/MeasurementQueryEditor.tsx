import React, { PureComponent } from 'react';
import { InlineField, Select, FeatureInfoBox } from '@grafana/ui';
import { QueryEditorProps, SelectableValue, LiveChannelScope, FeatureState } from '@grafana/data';
import { getLiveMeasurements } from '@grafana/runtime';
import { GrafanaDatasource } from '../datasource';
import { GrafanaQuery } from '../types';

type Props = QueryEditorProps<GrafanaDatasource, GrafanaQuery>;
interface State {
  channels: Array<SelectableValue<string>>; // all possible channels
  frames: Array<SelectableValue<string>>; // frame names
  fields: Array<SelectableValue<string>>; // names of the fields
  loading?: boolean;
}

const labelWidth = 12;

export class MeasurementQueryEditor extends PureComponent<Props, State> {
  state: State = {
    channels: [],
    frames: [],
    fields: [],
    loading: true,
  };

  componentDidMount = async () => {
    this.updateInfo();
  };

  componentDidUpdate = async (oldProps: Props) => {
    let { channel, measurements } = this.props.query;
    if (channel !== oldProps.query.channel || measurements !== oldProps.query.measurements) {
      this.updateInfo();
      return;
    }
  };

  updateInfo = async () => {
    let { channel, measurements } = this.props.query;

    const channels: Array<SelectableValue<string>> = [];
    const frames: Array<SelectableValue<string>> = [
      { value: '', label: 'All measurements', description: 'Show every measurement streamed to this channel' },
    ];
    const fields: Array<SelectableValue<string>> = [{ value: '', label: 'All fields', description: 'Show all fields' }];

    if (channel) {
      channels.push({
        value: channel,
        label: channel,
        description: `Connected to ${channel}`,
      });

      const info = getLiveMeasurements({
        scope: LiveChannelScope.Grafana,
        namespace: 'measurements',
        path: channel,
      });

      if (measurements) {
        if (info) {
          for (const fname of info.getDistinctNames()) {
            frames.push({
              value: fname,
              label: fname,
            });
          }

          const names: Set<string> = new Set<string>();
          const data = info.getData(measurements);
          if (data) {
            for (const frame of data) {
              for (const field of frame.fields) {
                if (!names.has(field.name)) {
                  fields.push({
                    value: field.name,
                    label: field.name,
                  });
                  names.add(field.name);
                }
              }
            }
          }

          if (measurements.fields) {
            for (const name of measurements.fields) {
              if (!names.has(name)) {
                fields.push({
                  value: name,
                  label: name,
                });
                names.add(name);
              }
            }
          }
        }
      }
    }
    this.setState({
      channels,
      frames,
      fields,
      loading: false,
    });
  };

  onChannelChange = (sel: SelectableValue<string>) => {
    const { onChange, query, onRunQuery } = this.props;
    onChange({ ...query, channel: sel?.value });
    onRunQuery();
  };

  onMeasurementNameChanged = (sel: SelectableValue<string>) => {
    const { onChange, query, onRunQuery } = this.props;
    onChange({
      ...query,
      measurements: {
        ...query.measurements,
        name: sel?.value,
      },
    });
    onRunQuery();
  };

  onFieldNamesChange = (sel: Array<SelectableValue<string>>) => {
    const fields = sel ? sel.map(s => s.value!) : [];
    const { onChange, query, onRunQuery } = this.props;

    // When adding your first name, also include time (if it exists)
    if (this.props.query.measurements?.fields && fields.length === 1) {
      for (const field of this.state.fields) {
        if (field.value!.toLowerCase() === 'time') {
          fields.push(field.value!);
          break;
        }
      }
    }

    onChange({
      ...query,
      measurements: {
        ...query.measurements,
        fields: fields.length ? fields : undefined,
      },
    });
    onRunQuery();
  };

  render() {
    let { channel, measurements } = this.props.query;

    // channels: Array<SelectableValue<string>>; // all possible channels
    // frames: Array<SelectableValue<string>>; // frame names
    // fields: Array<SelectableValue<string>>; // names of the fields
    // loading?: boolean;

    const { channels, frames, fields, loading } = this.state;
    const currentChannel = channels.find(c => c.value === channel);
    const currentFrame = measurements ? frames.find(f => f.value === measurements?.name) : undefined;

    return (
      <>
        <div className="gf-form">
          <InlineField label="Channel" grow={true} labelWidth={labelWidth}>
            <Select
              isLoading={loading}
              options={channels}
              value={currentChannel || ''}
              onChange={this.onChannelChange}
              allowCustomValue={true}
              backspaceRemovesValue={true}
              placeholder="Select measurements channel"
              isClearable={true}
              noOptionsMessage="Enter channel name"
              formatCreateLabel={(input: string) => `Conncet to: ${input}`}
            />
          </InlineField>
        </div>
        {channel && (
          <>
            <div className="gf-form">
              <InlineField label="Measurement" grow={true} labelWidth={labelWidth}>
                <Select
                  isLoading={loading}
                  options={frames}
                  value={currentFrame}
                  onChange={this.onMeasurementNameChanged}
                  allowCustomValue={true}
                  backspaceRemovesValue={true}
                  placeholder="Filter by name"
                  isClearable={true}
                  noOptionsMessage="Filter by name"
                  formatCreateLabel={(input: string) => `Show: ${input}`}
                  isSearchable={true}
                />
              </InlineField>
            </div>
            {measurements && (
              <div className="gf-form">
                <InlineField label="Field" grow={true} labelWidth={labelWidth}>
                  <Select
                    isMulti={true}
                    isLoading={loading}
                    options={fields}
                    value={measurements.fields}
                    onChange={this.onFieldNamesChange}
                    allowCustomValue={true}
                    backspaceRemovesValue={true}
                    placeholder="Show all fields"
                    isClearable={true}
                    noOptionsMessage="Filter by field name"
                    formatCreateLabel={(input: string) => `Show: ${input}`}
                    isSearchable={true}
                  />
                </InlineField>
              </div>
            )}
          </>
        )}

        <FeatureInfoBox title="Grafana Live - Measurements" featureState={FeatureState.alpha}>
          <p>
            This supports real-time event streams in Grafana core. This feature is under heavy development. Expect the
            interfaces and structures to change as this becomes more production ready.
          </p>
        </FeatureInfoBox>
      </>
    );
  }
}
