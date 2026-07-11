import { Request, Response } from 'express';
import { env } from '../config/env';
import { tollCalculateSchema, transactionFilterSchema } from '../schemas/toll.schema';
import * as tollService from '../services/toll.service';
import { generateReceiptPDF } from '../services/pdf.service';
import { success } from '../utils/response';
import { prisma } from '../config/database';

export const calculateToll = async (req: Request, res: Response) => {
  const query = tollCalculateSchema.parse(req.query);
  const amount = await tollService.calculateToll(query.bridgeId, query.category);
  return success(res, { amount, amountTaka: amount / 100 });
};

export const initPayment = async (req: Request, res: Response) => {
  const payment = await tollService.initTollPayment(req.user!.id, req.body.vehicleId, req.body.bridgeId, req.body.method);
  return success(res, payment, 'Toll payment initialized');
};

export const tollSuccess = async (req: Request, res: Response) => {
  const transaction = await tollService.handleSSLCommerzCallback({ ...req.query, ...req.body });
  return res.redirect(`${env.FRONTEND_URL}/toll/success?transactionId=${transaction.id}`);
};

export const getMyTransactions = async (req: Request, res: Response) => {
  const filters = transactionFilterSchema.parse(req.query);
  const transactions = await tollService.getMyTolls(req.user!.id, filters);
  return success(res, transactions);
};

export const getTransaction = async (req: Request, res: Response) => {
  const transaction = await tollService.getTransactionById(req.params.id, req.user!.id, req.user!.role === 'ADMIN');
  return success(res, transaction);
};

export const adminGetTransactions = async (req: Request, res: Response) => {
  const filters = transactionFilterSchema.parse(req.query);
  const transactions = await tollService.adminGetAllTransactions(filters);
  return success(res, transactions);
};

export const refundTransaction = async (req: Request, res: Response) => {
  const transaction = await tollService.processRefund(req.params.id, req.user!.id, req.body.reason, req.body.amount);
  return success(res, transaction, 'Refund processed');
};

export const approveTransaction = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { reason } = req.body;

  const transaction = await prisma.transaction.findUniqueOrThrow({ where: { id } });

  if (transaction.status !== 'PENDING') {
    return res.status(400).json({ message: 'Only PENDING transactions can be approved' });
  }
  if (transaction.type !== 'TOLL_PAYMENT') {
    return res.status(400).json({ message: 'Only TOLL_PAYMENT transactions can be approved' });
  }

  const updated = await prisma.transaction.update({
    where: { id },
    data: {
      status: 'SUCCESS',
      metadata: {
        ...((transaction.metadata as object) ?? {}),
        adminApprovedBy: req.user!.id,
        adminApprovedAt: new Date().toISOString(),
        adminApprovalReason: reason
      }
    }
  });
  return success(res, updated, 'Transaction approved successfully');
};

export const downloadReceipt = async (req: Request, res: Response) => {
  const pdf = await generateReceiptPDF(req.params.id, req.user!.id);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="tollbd-receipt-${req.params.id.slice(0, 8)}.pdf"`);
  res.setHeader('Cache-Control', 'private, no-cache');
  return res.send(pdf);
};
