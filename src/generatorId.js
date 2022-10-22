export default () => {
  let startId = 0;

  return () => {
    startId += 1;
    const newId = startId;
    return newId;
  };
};
