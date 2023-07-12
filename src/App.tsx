import { Box, Button, Center, Chip, Group, Header, Title } from '@mantine/core';
import { produce } from 'immer';
import { useCallback, useRef, useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';

const COL_SIZE = 40;
const ROW_SIZE = 25;

const neighboursOps = [
  [-1, 1],
  [-1, 0],
  [-1, -1],

  [0, 1],
  [0, -1],

  [1, 1],
  [1, 0],
  [1, -1],
];

const getBlankGrid = () => {
  let rows = [];
  for (let i = 0; i < ROW_SIZE; i++) {
    rows.push(Array.from(Array(COL_SIZE), () => 0));
  }
  return rows;
};

const App = () => {
  const [grid, setGrid] = useState(getBlankGrid);
  const [isRunning, setIsRunning] = useState(false);
  const [generation, setGeneration] = useState(0);

  const runningRef = useRef(isRunning);
  runningRef.current = isRunning;

  const generationRef = useRef(generation);
  generationRef.current = generation;

  const runSimulation = useCallback(() => {
    if (!runningRef.current) {
      return;
    }

    setGrid((grid) => {
      return produce(grid, (gridCopy) => {
        for (let i = 0; i < ROW_SIZE; i++) {
          for (let k = 0; k < COL_SIZE; k++) {
            let neighbourCount = 0;

            neighboursOps.forEach(([x, y]) => {
              const neighbourXPosition = i + x;
              const neighbourYPosition = k + y;

              if (
                neighbourXPosition >= 0 &&
                neighbourXPosition < ROW_SIZE &&
                neighbourYPosition >= 0 &&
                neighbourYPosition < COL_SIZE
              ) {
                neighbourCount += grid[neighbourXPosition][neighbourYPosition];
              }
            });

            if (neighbourCount < 2 || neighbourCount > 3) {
              // Any live cell with two or three live neighbours survives
              // All other live cells die in the next generation. Similarly, all other dead cells stay dead
              gridCopy[i][k] = 0;
            } else if (grid[i][k] === 0 && neighbourCount === 3) {
              // Any dead cell with three live neighbours becomes a live cell
              gridCopy[i][k] = 1;
            }
          }
        }
      });
    });

    setGeneration(generationRef.current + 1);

    setTimeout(runSimulation, 500);
  }, []);

  const startHandler = () => {
    if (!isRunning && checkGameField()) {
      toast.error('Game field is empty! Please, fill it with cells.', {
        id: 'empty',
      });
      return;
    }

    setIsRunning(!isRunning);

    if (!isRunning) {
      toast.success('Simulation is started!', { id: 'start' });
      runningRef.current = true;
      runSimulation();
    } else {
      toast.success('Simulation is stopped!', { id: 'stop' });
    }
  };

  const checkGameField = () => {
    let isGameFieldEmpty = true;
    for (let i = 0; i < ROW_SIZE; i++) {
      for (let k = 0; k < COL_SIZE; k++) {
        if (grid[i][k] === 1) {
          isGameFieldEmpty = false;
        }
      }
    }
    return isGameFieldEmpty;
  };

  const randomHandler = () => {
    const rows = [];
    for (let i = 0; i < ROW_SIZE; i++) {
      rows.push(
        Array.from(Array(COL_SIZE), () => (Math.random() > 0.7 ? 1 : 0))
      );
    }
    setGrid(rows);
    toast.success('Game field initialized with random cells!', {
      id: 'random',
    });
  };

  const clearHandler = () => {
    setIsRunning(false);
    setGeneration(0);
    setGrid(getBlankGrid);
    toast.error('Game field is cleared!', {
      id: 'clear',
    });
  };

  const cellClickHandler = (i: number, k: number) => {
    const newGrid = produce(grid, (gridCopy) => {
      gridCopy[i][k] = grid[i][k] ? 0 : 1;
    });
    setGrid(newGrid);
  };

  return (
    <Box px={50}>
      <Header
        height={50}
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'fixed',
          top: 0,
        }}
      >
        <Title order={3} pl={20}>
          Game of Life
        </Title>
        <Group pr={20}>
          <Button onClick={startHandler} size="xs">
            {isRunning ? 'Stop the simulation' : 'Start the simulation'}
          </Button>
          <Button
            onClick={randomHandler}
            color="orange"
            variant="outline"
            size="xs"
            disabled={isRunning}
          >
            Initiate with random cells
          </Button>
          <Button
            onClick={clearHandler}
            color="red"
            variant="outline"
            size="xs"
            disabled={isRunning}
          >
            Clear all cells
          </Button>
        </Group>
      </Header>
      <Center pt={80}>
        <Group>
          <Chip checked={false} color="red" variant="filled">
            Generation: {generation}
          </Chip>
          <Chip
            checked={false}
            color={isRunning ? 'green' : 'red'}
            variant="filled"
          >
            {isRunning ? 'Simulation is running' : "Simulation isn't running"}
          </Chip>
        </Group>
      </Center>
      <Center pt={20}>
        <Box
          sx={{
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
        </Box>
      </Center>
      <Toaster position="bottom-center" />
    </Box>
  );
};

export default App;
