import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Polyline, Line, Circle, Text as SvgText, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import { COLORS, SIZES } from '../constants/theme';

export default function CustomLineChart({
  data,
  width = 300,
  height = 220,
  padding = 40,
  xLabel = '',
  yLabel = '',
  showGrid = true,
  yMin = null,
  yMax = null,
  xMin = null,
  xMax = null,
}) {
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // Calculate min/max values
  const allValues = data.flatMap(dataset => dataset.data);
  const calculatedYMin = yMin !== null ? yMin : Math.min(...allValues);
  const calculatedYMax = yMax !== null ? yMax : Math.max(...allValues);
  const yRange = calculatedYMax - calculatedYMin;
  
  const xValues = data[0]?.xValues || data[0]?.data.map((_, i) => i);
  const calculatedXMin = xMin !== null ? xMin : Math.min(...xValues);
  const calculatedXMax = xMax !== null ? xMax : Math.max(...xValues);
  const xRange = calculatedXMax - calculatedXMin;

  // Helper to convert value to coordinates
  const getX = (value) => padding + ((value - calculatedXMin) / xRange) * chartWidth;
  const getY = (value) => padding + chartHeight - ((value - calculatedYMin) / yRange) * chartHeight;

  // Generate grid lines
  const gridLines = [];
  const ySteps = 5;
  const xSteps = 5;
  
  for (let i = 0; i <= ySteps; i++) {
    const y = calculatedYMin + (i / ySteps) * yRange;
    const yPos = getY(y);
    gridLines.push(
      <Line
        key={`y-grid-${i}`}
        x1={padding}
        y1={yPos}
        x2={width - padding}
        y2={yPos}
        stroke="rgba(0, 0, 0, 0.05)"
        strokeWidth="1"
      />
    );
  }
  
  for (let i = 0; i <= xSteps; i++) {
    const x = calculatedXMin + (i / xSteps) * xRange;
    const xPos = getX(x);
    gridLines.push(
      <Line
        key={`x-grid-${i}`}
        x1={xPos}
        y1={padding}
        x2={xPos}
        y2={height - padding}
        stroke="rgba(0, 0, 0, 0.05)"
        strokeWidth="1"
      />
    );
  }

  // Generate axis labels
  const yLabels = [];
  for (let i = 0; i <= ySteps; i++) {
    const y = calculatedYMin + (i / ySteps) * yRange;
    const yPos = getY(y);
    yLabels.push(
      <SvgText
        key={`y-label-${i}`}
        x={padding - 10}
        y={yPos + 4}
        fontSize="10"
        fill={COLORS.darkGray}
        textAnchor="end"
      >
        {y.toFixed(2)}
      </SvgText>
    );
  }

  const xLabels = [];
  const labelStep = Math.ceil(xValues.length / xSteps);
  for (let i = 0; i < xValues.length; i += labelStep) {
    const x = xValues[i];
    const xPos = getX(x);
    xLabels.push(
      <SvgText
        key={`x-label-${i}`}
        x={xPos}
        y={height - padding + 20}
        fontSize="10"
        fill={COLORS.darkGray}
        textAnchor="middle"
      >
        {Math.round(x).toString()}
      </SvgText>
    );
  }

  return (
    <View style={styles.container}>
      <Svg width={width} height={height}>
        <Defs>
          {data.map((dataset, idx) => (
            <LinearGradient key={`gradient-${idx}`} id={`gradient-${idx}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor={dataset.color} stopOpacity="0.3" />
              <Stop offset="100%" stopColor={dataset.color} stopOpacity="0" />
            </LinearGradient>
          ))}
        </Defs>
        
        {/* Grid lines */}
        {showGrid && gridLines}
        
        {/* Axis lines */}
        <Line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={height - padding}
          stroke={COLORS.darkGray}
          strokeWidth="2"
        />
        <Line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke={COLORS.darkGray}
          strokeWidth="2"
        />
        
        {/* Axis labels */}
        {yLabels}
        {xLabels}
        
        {/* Data lines */}
        {data.map((dataset, datasetIdx) => {
          const points = dataset.data.map((value, idx) => {
            const x = dataset.xValues ? dataset.xValues[idx] : xValues[idx];
            return `${getX(x)},${getY(value)}`;
          }).join(' ');

          return (
            <G key={`dataset-${datasetIdx}`}>
              <Polyline
                points={points}
                fill="none"
                stroke={dataset.color}
                strokeWidth={dataset.strokeWidth || 2}
                strokeDasharray={dataset.dashed ? '5,5' : undefined}
              />
              {dataset.showDots && dataset.data.map((value, idx) => {
                const x = dataset.xValues ? dataset.xValues[idx] : xValues[idx];
                return (
                  <Circle
                    key={`dot-${datasetIdx}-${idx}`}
                    cx={getX(x)}
                    cy={getY(value)}
                    r="3"
                    fill={dataset.color}
                  />
                );
              })}
            </G>
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

