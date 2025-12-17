declare module 'paystack-node' {
    export interface TransactionInitializeResponse {
      status: boolean;
      message: string;
      data: {
        authorization_url: string;
        access_code: string;
        reference: string;
      };
    }
  
    export interface TransactionVerifyResponse {
      status: boolean;
      message: string;
      data: {
        status: string;
        reference: string;
        amount: number;
        paid_at: string;
        created_at: string;
        channel: string;
        currency: string;
        customer: {
          id: number;
          first_name: string;
          last_name: string;
          email: string;
        };
      };
    }
  
    class Paystack {
      constructor(secretKey: string, environment: string);
  
      transaction: {
        initialize(data: {
          amount: number;
          email: string;
          reference?: string;
          callback_url?: string;
        }): Promise<TransactionInitializeResponse>;
  
        verify(reference: string): Promise<TransactionVerifyResponse>;
      };
    }
  
    export default Paystack;
  }
  