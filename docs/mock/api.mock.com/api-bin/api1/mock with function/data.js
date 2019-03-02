module.exports = function(ctx) {
  const { request: req } = ctx;
  let { id } = req.query;

  return {
    data: {
      code: '0',
      msg: `you request with id: ${id}`
    }
  };
};
