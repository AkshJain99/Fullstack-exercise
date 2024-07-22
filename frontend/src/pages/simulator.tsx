import React, { useState } from 'react';
import { Col, Divider, Row, Form, Input, Button, Select, Statistic, Descriptions } from 'antd';
import ReactECharts from 'echarts-for-react';
import { CommuteMode, Scenario, SimulationResult, TotalByMode } from './types';

const { Option } = Select;

export function SimulatorPage() {
  const [form] = Form.useForm();
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);

  const handleSubmit = async (values: Scenario) => {
    const primaryMode = values.primary_mode;
    
    //making 10 km as default one way distance as per the requirements
    const oneWayDistance = values.one_way_distance !== undefined && values.one_way_distance !== null ? values.one_way_distance : 10;

    // I am converting all values to strings for URL parameters for search
    const params = new URLSearchParams({
      primary_mode: primaryMode,
      one_way_distance: oneWayDistance.toString(),
      ...(values.commute_days_per_year && { commute_days_per_year: values.commute_days_per_year.toString() }),
      ...(values.primary_mode_proportion && { primary_mode_proportion: values.primary_mode_proportion.toString() }),
      ...(values.secondary_mode && { secondary_mode: values.secondary_mode }),
      ...(values.secondary_mode_proportion && { secondary_mode_proportion: values.secondary_mode_proportion.toString() }),
    }).toString();

    try {
      const response = await fetch(`http://127.0.0.1:5000/simulate?${params}`);
      const data: SimulationResult = await response.json();
      setSimulationResult(data);
    } catch (error) {
      console.error('Error fetching simulation results:', error);
    }
  };

  const renderChart = (data: TotalByMode[]) => {
    const chartOptions = {
      xAxis: {
        type: 'category',
        data: data.map((item) => item.mode),
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          data: data.map((item) => item.total_kg_co2e),
          type: 'bar',
        },
      ],
    };

    return <ReactECharts option={chartOptions} />;
  };

  const renderScenarioDetails = (scenario: Scenario) => {
    return (
      <Descriptions title="Simulation Scenario" bordered column={1} size="small">
        <Descriptions.Item label="Primary Mode">{scenario.primary_mode}</Descriptions.Item>
        <Descriptions.Item label="Secondary Mode">{scenario.secondary_mode || 'None'}</Descriptions.Item>
        <Descriptions.Item label="One Way Distance (km)">{scenario.one_way_distance}</Descriptions.Item>
        <Descriptions.Item label="Commute Days per Year">{scenario.commute_days_per_year}</Descriptions.Item>
        <Descriptions.Item label="Primary Mode Proportion">{scenario.primary_mode_proportion}</Descriptions.Item>
        <Descriptions.Item label="Secondary Mode Proportion">{scenario.secondary_mode_proportion}</Descriptions.Item>
      </Descriptions>
    );
  };

  return (
    <Row gutter={16}>
      <Col span={6}>
        <h1>Controls</h1>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="primary_mode" label="Primary Mode" rules={[{ required: true }]}>
            <Select>
              <Option value={CommuteMode.CAR}>Car</Option>
              <Option value={CommuteMode.BUS}>Bus</Option>
              <Option value={CommuteMode.TRAIN}>Train</Option>
              <Option value={CommuteMode.BIKE}>Bike</Option>
              <Option value={CommuteMode.WALK}>Walk</Option>
              <Option value={CommuteMode.MOTORBIKE}>Motorbike</Option>
            </Select>
          </Form.Item>
          <Form.Item name="secondary_mode" label="Secondary Mode">
            <Select>
              <Option value={CommuteMode.CAR}>Car</Option>
              <Option value={CommuteMode.BUS}>Bus</Option>
              <Option value={CommuteMode.TRAIN}>Train</Option>
              <Option value={CommuteMode.BIKE}>Bike</Option>
              <Option value={CommuteMode.WALK}>Walk</Option>
              <Option value={CommuteMode.MOTORBIKE}>Motorbike</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="one_way_distance"
            label="One Way Distance (km)"
            initialValue={10}
            rules={[{ required: true, type: 'number', message: 'Please input distance!' }]}
          >
            <Input type="number" min={0} />
          </Form.Item>
          <Form.Item name="commute_days_per_year" label="Commute Days per Year">
            <Input type="number" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">Simulate</Button>
          </Form.Item>
        </Form>
      </Col>
      <Col span={1}>
        <Divider type="vertical" style={{ height: '100%' }} />
      </Col>
      <Col span={17}>
        <h1>Effect</h1>
        {simulationResult && (
          <>
            <Row gutter={16}>
              <Col span={12}>
                <Statistic title="Total kg CO2e" value={simulationResult.total_kg_co2e} />
              </Col>
            </Row>
            <h3>CO2 Emissions by Commute Mode</h3>
            {renderChart(simulationResult.total_kg_co2e_per_mode)}
            <h3>Simulation Scenario</h3>
            <div style={{ margin: '16px 0' }}>
              {renderScenarioDetails(simulationResult.scenario)}
            </div>
          </>
        )}
      </Col>
    </Row>
  );
}

export default SimulatorPage;
