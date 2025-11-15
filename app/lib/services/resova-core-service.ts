/**
 * Resova Core API Service
 * Handles Customers, Gift Vouchers, and Baskets from Resova Core APIs
 */

import { config } from '../../config/environment';
import { ApiError, NetworkError, ServiceOptions } from '@/app/types/analytics';
import { logger } from '../utils/logger';
import {
  ResovaCustomer,
  CustomerListResponse,
  ResovaGiftVoucher,
  GiftVoucherListResponse,
  ResovaBasket,
  BasketListResponse
} from '@/app/types/resova-core';

export interface ResovaCoreServiceOptions extends ServiceOptions {
  apiKey: string;
  baseUrl?: string;
}

export class ResovaCoreService {
  private apiKey: string;
  private baseUrl: string;
  private timeout: number;

  constructor(options: ResovaCoreServiceOptions) {
    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl || config.api.resova.baseUrl;
    this.timeout = options.timeout || config.api.resova.timeout;
  }

  /**
   * Get all customers with pagination support
   */
  async getCustomers(page: number = 1, perPage: number = 100): Promise<ResovaCustomer[]> {
    try {
      logger.info(`Fetching customers (page ${page}, ${perPage} per page)`);

      const url = `${this.baseUrl}/customers?page=${page}&per_page=${perPage}`;

      const response = await this.fetchWithTimeout(url, {
        method: 'GET',
        headers: {
          'X-API-KEY': this.apiKey,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          `Resova API error: ${errorData.message || response.statusText}`,
          response.status,
          errorData
        );
      }

      const data: CustomerListResponse = await response.json();
      logger.info(`Fetched ${data.data.length} customers`);

      return data.data;
    } catch (error: any) {
      if (error instanceof ApiError) {
        throw error;
      }

      logger.error('Failed to fetch customers', error);
      throw new NetworkError('Failed to fetch customers from Resova API', error);
    }
  }

  /**
   * Get all customers (fetches all pages if needed)
   */
  async getAllCustomers(maxPages: number = 5): Promise<ResovaCustomer[]> {
    let allCustomers: ResovaCustomer[] = [];
    let currentPage = 1;

    try {
      while (currentPage <= maxPages) {
        const customers = await this.getCustomers(currentPage, 100);

        if (customers.length === 0) {
          break; // No more customers
        }

        allCustomers = [...allCustomers, ...customers];

        // If we got less than 100, we've reached the end
        if (customers.length < 100) {
          break;
        }

        currentPage++;
      }

      logger.info(`Fetched total of ${allCustomers.length} customers across ${currentPage} pages`);
      return allCustomers;
    } catch (error) {
      logger.error('Failed to fetch all customers', error);
      throw error;
    }
  }

  /**
   * Get all gift vouchers
   */
  async getGiftVouchers(page: number = 1, perPage: number = 100): Promise<ResovaGiftVoucher[]> {
    try {
      logger.info(`Fetching gift vouchers (page ${page}, ${perPage} per page)`);

      const url = `${this.baseUrl}/gift-vouchers?page=${page}&per_page=${perPage}`;

      const response = await this.fetchWithTimeout(url, {
        method: 'GET',
        headers: {
          'X-API-KEY': this.apiKey,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          `Resova API error: ${errorData.message || response.statusText}`,
          response.status,
          errorData
        );
      }

      const data: GiftVoucherListResponse = await response.json();
      logger.info(`Fetched ${data.data.length} gift vouchers`);

      return data.data;
    } catch (error: any) {
      if (error instanceof ApiError) {
        throw error;
      }

      logger.error('Failed to fetch gift vouchers', error);
      throw new NetworkError('Failed to fetch gift vouchers from Resova API', error);
    }
  }

  /**
   * Get all gift vouchers (fetches all pages if needed)
   */
  async getAllGiftVouchers(maxPages: number = 5): Promise<ResovaGiftVoucher[]> {
    let allVouchers: ResovaGiftVoucher[] = [];
    let currentPage = 1;

    try {
      while (currentPage <= maxPages) {
        const vouchers = await this.getGiftVouchers(currentPage, 100);

        if (vouchers.length === 0) {
          break;
        }

        allVouchers = [...allVouchers, ...vouchers];

        if (vouchers.length < 100) {
          break;
        }

        currentPage++;
      }

      logger.info(`Fetched total of ${allVouchers.length} gift vouchers across ${currentPage} pages`);
      return allVouchers;
    } catch (error) {
      logger.error('Failed to fetch all gift vouchers', error);
      throw error;
    }
  }

  /**
   * Get all baskets/carts (including abandoned ones)
   */
  async getBaskets(page: number = 1, perPage: number = 100, status?: string): Promise<ResovaBasket[]> {
    try {
      logger.info(`Fetching baskets (page ${page}, ${perPage} per page, status: ${status || 'all'})`);

      let url = `${this.baseUrl}/baskets?page=${page}&per_page=${perPage}`;
      if (status) {
        url += `&status=${status}`;
      }

      const response = await this.fetchWithTimeout(url, {
        method: 'GET',
        headers: {
          'X-API-KEY': this.apiKey,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          `Resova API error: ${errorData.message || response.statusText}`,
          response.status,
          errorData
        );
      }

      const data: BasketListResponse = await response.json();
      logger.info(`Fetched ${data.data.length} baskets`);

      return data.data;
    } catch (error: any) {
      if (error instanceof ApiError) {
        throw error;
      }

      logger.error('Failed to fetch baskets', error);
      throw new NetworkError('Failed to fetch baskets from Resova API', error);
    }
  }

  /**
   * Get abandoned carts specifically
   */
  async getAbandonedCarts(maxPages: number = 3): Promise<ResovaBasket[]> {
    let allCarts: ResovaBasket[] = [];
    let currentPage = 1;

    try {
      while (currentPage <= maxPages) {
        const carts = await this.getBaskets(currentPage, 100, 'abandoned');

        if (carts.length === 0) {
          break;
        }

        allCarts = [...allCarts, ...carts];

        if (carts.length < 100) {
          break;
        }

        currentPage++;
      }

      logger.info(`Fetched total of ${allCarts.length} abandoned carts across ${currentPage} pages`);
      return allCarts;
    } catch (error) {
      logger.error('Failed to fetch abandoned carts', error);
      throw error;
    }
  }

  /**
   * Fetch with timeout helper
   */
  private async fetchWithTimeout(
    url: string,
    options: RequestInit,
    timeout: number = this.timeout
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new NetworkError(`Request timeout after ${timeout}ms`, error);
      }
      throw error;
    }
  }
}
