import { ExecutorEncoder } from 'executooor-ethers';
import { BytesLike, BigNumberish } from 'ethers';
import { OrderSpoke__factory } from '../typechain-types';
import type { FillOrderDto } from '../dto/contracts.dto'; // adjust path

export class CustomExecutorEncoder extends ExecutorEncoder {
  // Attach the OrderSpoke interface statically
  public static readonly ORDER_SPOKE_IFC = OrderSpoke__factory.createInterface();

  zeroXSwap(to: string, data: BytesLike) {
    return this.pushCall(to, 0n, data);
  }

  fillOrder(orderSpoke: string, fillDto: FillOrderDto, fee: BigNumberish) {
    const paddedWallet = '0x' + fillDto.fundingWallet.slice(2).padStart(64, '0');

    const callData = CustomExecutorEncoder.ORDER_SPOKE_IFC.encodeFunctionData('fillOrder', [
      fillDto.order,
      fillDto.orderNonce,
      paddedWallet,
      fillDto.maxGas,
      fillDto.options,
    ]);

    return this.pushCall(orderSpoke, BigInt(fee), callData);
  }
}
