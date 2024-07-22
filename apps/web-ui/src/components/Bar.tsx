import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface BarProps {
  startPosition: number; // Percentage
  endPosition: number; // Percentage
}

const BarComponent: React.FC<BarProps> = ({ startPosition, endPosition }) => {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const drawBar = () => {
      // Clear the SVG to prevent duplication
      d3.select(ref.current).selectAll('*').remove();

      // Set the dimensions of the bar
      const width = ref.current?.parentElement?.offsetWidth ?? 0;
      const height = 5;

      // Calculate actual start position and inner width based on percentages
      const actualStartPosition = (startPosition / 100) * width;
      const actualEndPosition = (endPosition / 100) * width;
      const innerWidth = actualEndPosition - actualStartPosition;

      // Create SVG container
      const svg = d3.select(ref.current).attr('width', width).attr('height', height);

      // Draw the outer bar
      svg.append('rect').attr('width', width).attr('height', height).attr('fill', '#ccc');

      // Draw the inner rectangle based on calculated start and inner width
      svg.append('rect').attr('x', actualStartPosition).attr('width', innerWidth).attr('height', height).attr('fill', 'steelblue');
    };

    drawBar();

    const handleResize = () => {
      drawBar();
    };

    window.addEventListener('resize', handleResize);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [startPosition, endPosition]);

  return <svg ref={ref} width='100%' height='5'></svg>;
};

export default BarComponent;
