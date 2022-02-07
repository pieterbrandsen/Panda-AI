export default function BuyOrders():void {
    if (Game.shard.name === "shard0") {
        let orders = Game.market.getAllOrders(
          (order) =>
            order.resourceType === CPU_UNLOCK &&
            order.type === ORDER_BUY &&
            order.price > 37 * 1000 * 1000
        );
    
        for (let i = 0; i < orders.length; i += 1) {
          const order = orders[i];
          const result = Game.market.deal(order.id, 100);
          if (result === OK) {
            const message = `Dealed CPU UNLOCK ${order.amount} for ${order.price}`;
            Game.notify(message, 0);
            console.log(message);
          }
        }
    
        orders = Game.market.getAllOrders(
          (order) =>
            order.resourceType === PIXEL &&
            order.type === ORDER_SELL &&
            order.price < 10 * 1000
        );
    
        for (let i = 0; i < orders.length; i += 1) {
          const order = orders[i];
          const result = Game.market.deal(order.id, 10000);
          if (result === OK) {
            const message = `Dealed PIXEL ${order.amount} for ${order.price}`;
            Game.notify(message, 0);
            console.log(message);
          }
        }
      }
}