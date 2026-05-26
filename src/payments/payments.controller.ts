import {
  Body,
  Controller,
  HttpCode,
  Post,
  RawBodyRequest,
  Req,
  Headers,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { PaymentsService } from './payments.service';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('create-checkout-session')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.PASSENGER)
  @HttpCode(201)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create Stripe Checkout Session for a booking. Passenger only.',
    description:
      'Returns a Stripe-hosted checkout URL. Passenger is redirected to this URL to complete payment.',
  })
  @ApiResponse({
    status: 201,
    description: 'Checkout session created.',
    schema: { example: { url: 'https://checkout.stripe.com/...' } },
  })
  createCheckoutSession(
    @CurrentUser() user: any,
    @Body() body: CreateCheckoutSessionDto,
  ): Promise<{ url: string }> {
    return this.paymentsService.createCheckoutSession(user.id, body);
  }

  @Post('webhook')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Stripe webhook endpoint. Called by Stripe server — do NOT call manually.',
    description:
      'Verifies Stripe signature and processes checkout.session.completed, ' +
      'checkout.session.expired, and charge.refunded events.',
  })
  @ApiResponse({ status: 200 })
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ): Promise<void> {
    const rawBody = req.rawBody!;
    const event = this.paymentsService.constructWebhookEvent(rawBody, signature);
    await this.paymentsService.handleWebhookEvent(event);
  }
}
