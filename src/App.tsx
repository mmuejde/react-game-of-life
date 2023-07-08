import { Box, Button, Group } from '@mantine/core';
import { produce } from 'immer';
import { useCallback, useRef, useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';

const COL_SIZE = 50;
const ROW_SIZE = 50;

const operations = [
  [0, 1],
  [0, -1],
  [1, -1],
  [-1, 1],
  [1, 1],
  [-1, -1],
  [1, 0],
  [-1, 0],
];

const App = () => {
  const [isRunning, setIsRunning] = useState(false);

  const getBlankGrid = () => {
    let rows = [];
    for (let i = 0; i < ROW_SIZE; i++) {
      rows.push(Array.from(Array(COL_SIZE), () => 0));
    }
    return rows;
  };

  const [grid, setGrid] = useState(getBlankGrid);

  const runningRef = useRef(isRunning);
  runningRef.current = isRunning;

  const runSimulation = useCallback(() => {
    if (!runningRef.current) {
      return;
    }

    setGrid((g) => {
      return produce(g, (gridCopy) => {
        for (let i = 0; i < ROW_SIZE; i++) {
          for (let k = 0; k < COL_SIZE; k++) {
            let neighbors = 0;

            operations.forEach(([x, y]) => {
              const newI = i + x;
              const newK = k + y;

              if (
                newI >= 0 &&
                newI < ROW_SIZE &&
                newK >= 0 &&
                newK < COL_SIZE
              ) {
                neighbors += g[newI][newK];
              }
            });

            if (neighbors < 2 || neighbors > 3) {
              gridCopy[i][k] = 0;
            } else if (g[i][k] === 0 && neighbors === 3) {
              gridCopy[i][k] = 1;
            }
          }
        }
      });
    });

    setTimeout(runSimulation, 500);
  }, []);

  const startHandler = () => {
    setIsRunning(!isRunning);

    if (!isRunning) {
      toast.success('Simulation is started!');
      runningRef.current = true;
      runSimulation();
    }
  };

  const pauseHandler = () => {};

  const randomHandler = () => {};

  const clearHandler = () => {
    setGrid(getBlankGrid);
    toast.error('Game field is cleared!');
  };

  const cellClickHandler = (i: number, k: number) => {
    const newGrid = produce(grid, (gridCopy) => {
      gridCopy[i][k] = grid[i][k] ? 0 : 1;
    });
    setGrid(newGrid);
  };

  return (
    <Box px={50}>
      <Group
        position="right"
        sx={{
          height: 50,
        }}
      >
        <Button onClick={startHandler}>
          {isRunning ? 'Stop the simulation' : 'Start the simulation'}
        </Button>
        <Button onClick={pauseHandler} color="yellow">
          Pause
        </Button>
        <Button onClick={randomHandler} color="orange" variant="outline">
          Random cells
        </Button>
        <Button onClick={clearHandler} color="red" variant="outline">
          Clear game field
        </Button>
      </Group>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${COL_SIZE}, 30px)`,
        }}
      >
        {grid.map((rows, i) =>
          rows.map((col, k) => (
            <Box
              key={`${i}-${k}`}
              sx={{
                width: '30px',
                height: '30px',
                backgroundColor: grid[i][k] ? 'black' : undefined,
                border: 'solid 1px black',
                ':hover': {
                  backgroundColor: grid[i][k] ? 'black' : 'gray',
                  cursor: 'pointer',
                },
              }}
              onClick={() => {
                cellClickHandler(i, k);
              }}
            ></Box>
          ))
        )}
      </div>
      <Toaster position="bottom-center" />
    </Box>
  );
};

export default App;
