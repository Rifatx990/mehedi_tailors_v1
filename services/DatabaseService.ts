/**
 * ATELIER REST GATEWAY (PostgreSQL Backend Client)
 */

export class DatabaseService {
  private readonly baseUrl: string = '/api';

  public async request<T>(path: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        let errorMessage = `API Error: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) {}
        throw new Error(errorMessage);
      }

      return response.json();
    } catch (err: any) {
      console.error(`API Error [${path}]:`, err.message);
      throw err;
    }
  }

  async checkHealth() { return this.request<{status: string}>('/health'); }

  async verifySmtp(config: any) {
    return this.request<any>('/verify-smtp', {
      method: 'POST',
      body: JSON.stringify(config)
    });
  }

  async initPayment(order: any) {
    return this.request<any>('/payment/init', { method: 'POST', body: JSON.stringify(order) });
  }

  // --- bKash Handshake ---
  async createBkashPayment(order: any) {
    return this.request<any>('/bkash/create', { method: 'POST', body: JSON.stringify(order) });
  }

  async executeBkashPayment(paymentID: string, orderId: string) {
    return this.request<any>('/bkash/execute', { method: 'POST', body: JSON.stringify({ paymentID, orderId }) });
  }

  async getUsers() { return this.request<any[]>('/users'); }
  async saveUser(user: any) { 
    return this.request<any>(`/users${user.id && !user._isNew ? `/${user.id}` : ''}`, {
      method: user.id && !user._isNew ? 'PUT' : 'POST',
      body: JSON.stringify(user)
    });
  }
  async deleteUser(id: string) { return this.request(`/users/${id}`, { method: 'DELETE' }); }

  async getProducts() { return this.request<any[]>('/products'); }
  async saveProduct(p: any) {
    return this.request<any>(`/products${p.id && !p._isNew ? `/${p.id}` : ''}`, {
      method: p.id && !p._isNew ? 'PUT' : 'POST',
      body: JSON.stringify(p)
    });
  }
  async deleteProduct(id: string) { return this.request(`/products/${id}`, { method: 'DELETE' }); }

  async getOrders() { return this.request<any[]>('/orders'); }
  async saveOrder(order: any) {
    return this.request<any>(`/orders${order.id && !order._isNew ? `/${order.id}` : ''}`, {
      method: order.id && !order._isNew ? 'PATCH' : 'POST',
      body: JSON.stringify(order)
    });
  }
  async deleteOrder(id: string) { return this.request(`/orders/${id}`, { method: 'DELETE' }); }

  async getDues() { return this.request<any[]>('/dues'); }
  async saveDue(due: any) {
    return this.request<any>(`/dues${due.id && !due._isNew ? `/${due.id}` : ''}`, {
      method: due.id && !due._isNew ? 'PUT' : 'POST',
      body: JSON.stringify(due)
    });
  }
  async deleteDue(id: string) { return this.request(`/dues/${id}`, { method: 'DELETE' }); }

  async getConfig() { return this.request<any>('/config'); }
  async updateConfig(config: any) {
    return this.request<any>('/config', { method: 'PUT', body: JSON.stringify(config) });
  }

  async getBanners() { return this.request<any[]>('/banners'); }
  async saveBanner(b: any) {
    return this.request<any>(`/banners${b.id && !b._isNew ? `/${b.id}` : ''}`, {
      method: b.id && !b._isNew ? 'PUT' : 'POST',
      body: JSON.stringify(b)
    });
  }
  async deleteBanner(id: string) { return this.request(`/banners/${id}`, { method: 'DELETE' }); }

  async getNotices() { return this.request<any[]>('/notices'); }
  async saveNotice(n: any) {
    return this.request<any>(`/notices${n.id && !n._isNew ? `/${n.id}` : ''}`, {
      method: n.id && !n._isNew ? 'PUT' : 'POST',
      body: JSON.stringify(n)
    });
  }
  async deleteNotice(id: string) { return this.request(`/notices/${id}`, { method: 'DELETE' }); }

  async getOffers() { return this.request<any[]>('/offers'); }
  async saveOffer(o: any) {
    return this.request<any>(`/offers${o.id && !o._isNew ? `/${o.id}` : ''}`, {
      method: o.id && !o._isNew ? 'PUT' : 'POST',
      body: JSON.stringify(o)
    });
  }
  async deleteOffer(id: string) { return this.request(`/offers/${id}`, { method: 'DELETE' }); }

  async getBespokeServices() { return this.request<any[]>('/bespoke-services'); }
  async saveBespokeService(s: any) {
    return this.request<any>(`/bespoke-services${s.id && !s._isNew ? `/${s.id}` : ''}`, {
      method: s.id && !s._isNew ? 'PUT' : 'POST',
      body: JSON.stringify(s)
    });
  }
  async deleteBespokeService(id: string) { return this.request(`/bespoke-services/${id}`, { method: 'DELETE' }); }

  async getPartners() { return this.request<any[]>('/partners'); }
  async savePartner(p: any) {
    return this.request<any>(`/partners${p.id && !p._isNew ? `/${p.id}` : ''}`, {
      method: p.id && !p._isNew ? 'PUT' : 'POST',
      body: JSON.stringify(p)
    });
  }
  async deletePartner(id: string) { return this.request(`/partners/${id}`, { method: 'DELETE' }); }
  
  async getMaterialRequests() { return this.request<any[]>('/material-requests'); }
  async saveMaterialRequest(r: any) {
    return this.request<any>(`/material-requests${r.id && !r._isNew ? `/${r.id}` : ''}`, {
      method: r.id && !r._isNew ? 'PUT' : 'POST',
      body: JSON.stringify(r)
    });
  }

  async getProductRequests() { return this.request<any[]>('/product-requests'); }
  async saveProductRequest(r: any) {
    return this.request<any>('/product-requests', { method: 'POST', body: JSON.stringify(r) });
  }

  async getReviews() { return this.request<any[]>('/reviews'); }
  async saveReview(r: any) {
    return this.request<any>(`/reviews${r.id && !r._isNew ? `/${r.id}` : ''}`, {
      method: r.id && !r._isNew ? 'PUT' : 'POST',
      body: JSON.stringify(r)
    });
  }
  async deleteReview(id: string) { return this.request(`/reviews/${id}`, { method: 'DELETE' }); }

  async getEmails() { return this.request<any[]>('/emails'); }

  // FIX: Added missing getFabrics method
  async getFabrics() { return this.request<any[]>('/fabrics'); }
  // FIX: Added missing saveFabric method
  async saveFabric(f: any) {
    return this.request<any>(`/fabrics${f.id && !f._isNew ? `/${f.id}` : ''}`, {
      method: f.id && !f._isNew ? 'PUT' : 'POST',
      body: JSON.stringify(f)
    });
  }
  // FIX: Added missing deleteFabric method
  async deleteFabric(id: string) { return this.request(`/fabrics/${id}`, { method: 'DELETE' }); }

  // FIX: Added missing getCoupons method
  async getCoupons() { return this.request<any[]>('/coupons'); }
  // FIX: Added missing saveCoupon method
  async saveCoupon(c: any) {
    return this.request<any>(`/coupons${c.id && !c._isNew ? `/${c.id}` : ''}`, {
      method: c.id && !c._isNew ? 'PUT' : 'POST',
      body: JSON.stringify(c)
    });
  }
  // FIX: Added missing deleteCoupon method
  async deleteCoupon(id: string) { return this.request(`/coupons/${id}`, { method: 'DELETE' }); }

  // FIX: Added missing getGiftCards method
  async getGiftCards() { return this.request<any[]>('/gift-cards'); }
  // FIX: Added missing saveGiftCard method
  async saveGiftCard(gc: any) {
    return this.request<any>(`/gift-cards${gc.id && !gc._isNew ? `/${gc.id}` : ''}`, {
      method: gc.id && !gc._isNew ? 'PUT' : 'POST',
      body: JSON.stringify(gc)
    });
  }
  // FIX: Added missing deleteGiftCard method
  async deleteGiftCard(id: string) { return this.request(`/gift-cards/${id}`, { method: 'DELETE' }); }

  // FIX: Added missing getUpcoming method
  async getUpcoming() { return this.request<any[]>('/upcoming'); }
  // FIX: Added missing saveUpcoming method
  async saveUpcoming(p: any) {
    return this.request<any>(`/upcoming${p.id && !p._isNew ? `/${p.id}` : ''}`, {
      method: p.id && !p._isNew ? 'PUT' : 'POST',
      body: JSON.stringify(p)
    });
  }
  // FIX: Added missing deleteUpcoming method
  async deleteUpcoming(id: string) { return this.request(`/upcoming/${id}`, { method: 'DELETE' }); }
}

export const dbService = new DatabaseService();
