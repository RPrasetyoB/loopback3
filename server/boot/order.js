const {getToken, loggedUser} = require('../utils');

module.exports = function(app) {
  const Order = app.models.Order;
  const OrderItem = app.models.Order_item;
  const MenuItem = app.models.Menu_item;

    // create order
  app.post('/api/order', function(req, res, next) {
    const token = getToken(req);
    const {userId} = loggedUser(token);
    const {menuItemId, quantity} = req.body;
    try {
      Order.create({customerId: userId}, function(err, order) {
        if (err) {
          return next(err);
        }
        const orderItems = menuItemId.map((itemId, index) => {
          return {
            orderId: order.id,
            menuItemId: itemId,
            quantity: quantity[index],
          };
        });
        OrderItem.create(orderItems, function(err, orderItem) {
          if (err) {
            return next(err);
          }
        });
        res.status(200).json({message: 'Order created successfully', data: order});
      });
    } catch (error) {
      return next(error);
    }
  });

  // get customer order
  app.get('/api/order', function(req, res, next) {
    const token = getToken(req);
    const {userId} = loggedUser(token);
    try {
      Order.find({where: {customerId: userId}}, function(err, orders) {
        if (err) {
          return next(err);
        }
        const orderIds = orders.map(order => order.id);
        OrderItem.find({where: {orderId: {inq: orderIds}}}, function(err, orderItems) {
          if (err) {
            return next(err);
          }
          const menuItemIds = [...new Set(orderItems.map(item => item.menuItemId))];
          MenuItem.find({where: {id: {inq: menuItemIds}}}, function(err, menuItems) {
            if (err) {
              return next(err);
            }
            const data = orderItems.map(orderItem => {
              const menuItem = menuItems.find(item => item.id === orderItem.menuItemId);
              return {
                orderId: orderItem.orderId,
                orderItemId: orderItem.id,
                menuItemId: orderItem.menuItemId,
                menuItemName: menuItem ? menuItem.name : 'Unknown',
                quantity: orderItem.quantity,
              };
            });
            res.status(200).json({message: 'Orders fetched successfully', data: data});
          });
        });
      });
    } catch (error) {
      return next(error);
    }
  });

  // update order
  app.put('/api/order/:id', function(req, res, next) {
    const token = getToken(req);
    const {userId} = loggedUser(token);
    const {id} = req.params;
    const {menuItemId, quantity} = req.body;
    try {
      Order.findById(id, function(err, order) {
        if (err || !order) {
          return next(err || new Error('Order not found'));
        }
        if (order.customerId !== userId) {
          return res.status(403).json({message: 'Unauthorized to update this order'});
        }
        OrderItem.destroyAll({orderId: id}, function(err) {
          if (err) {
            return next(err);
          }
          const orderItems = menuItemId.map((itemId, index) => {
            return {
              orderId: id,
              menuItemId: itemId,
              quantity: quantity[index],
            };
          });
          OrderItem.create(orderItems, function(err, orderItem) {
            if (err) {
              return next(err);
            }

            res.status(200).json({message: 'Order updated successfully'});
          });
        });
      });
    } catch (error) {
      return next(error);
    }
  });

  // delete order
  app.delete('/api/order/:id', function(req, res, next) {
    const token = getToken(req);
    const {userId} = loggedUser(token);
    const {id} = req.params;
    const {menuItemId, quantity} = req.body;
    try {
      Order.findById(id, function(err, order) {
        if (err || !order) {
          return next(err || new Error('Order not found'));
        }
        if (order.customerId !== userId) {
          return res.status(403).json({message: 'Unauthorized to update this order'});
        }
        OrderItem.destroyAll({orderId: id}, function(err) {
          if (err) {
            return next(err);
          }
          res.status(200).json({message: 'Order deleted successfully'});
        });
      });
    } catch (error) {
      return next(error);
    }
  });
};
