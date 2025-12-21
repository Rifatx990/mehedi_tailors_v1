
/**
 * ATELIER REST GATEWAY (PostgreSQL Backend Client)
 * Interfaces with the Node.js API layer.
 */

export class DatabaseService {
  private readonly baseUrl: string = 'http://localhost:3001/api';

  private async request<T>(path: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'API Handshake Failed' }));
      throw new Error(error.message || `API Error: ${response.status}`);
    }

    return response.json();
  }

  // --- IDENTITY & ACCESS ---
  async getUsers() { return this.request<any[]>('/users'); }
  async saveUser(user: any) { 
    return this.request<any>(`/users${user.id ? `/${user.id}` : ''}`, {
      method: user.id ? 'PUT' : 'POST',
      body: JSON.stringify(user)
    });
  }
  async deleteUser(id: string) { return this.request(`/users/${id}`, { method: 'DELETE' }); }

  // --- INVENTORY ---
  async getProducts() { return this.request<any[]>('/products'); }
  async saveProduct(p: any) {
    return this.request<any>(`/products${p.id ? `/${p.id}` : ''}`, {
      method: p.id ? 'PUT' : 'POST',
      body: JSON.stringify(p)
    });
  }
  async deleteProduct(id: string) { return this.request(`/products/${id}`, { method: 'DELETE' }); }

  async getUpcoming() { return this.request<any[]>('/upcoming'); }
  async saveUpcoming(p: any) {
    return this.request<any>(`/upcoming${p.id ? `/${p.id}` : ''}`, {
      method: p.id ? 'PUT' : 'POST',
      body: JSON.stringify(p)
    });
  }

  async getFabrics() { return this.request<any[]>('/fabrics'); }
  async saveFabric(f: any) {
    return this.request<any>(`/fabrics${f.id ? `/${f.id}` : ''}`, {
      method: f.id ? 'PUT' : 'POST',
      body: JSON.stringify(f)
    });
  }
  async deleteFabric(id: string) { return this.request(`/fabrics/${id}`, { method: 'DELETE' }); }

  // --- TRANSACTIONS ---
  async getOrders() { return this.request<any[]>('/orders'); }
  async saveOrder(order: any) {
    return this.request<any>(`/orders${order.id ? `/${order.id}` : ''}`, {
      method: order.id ? 'PATCH' : 'POST',
      body: JSON.stringify(order)
    });
  }
  async deleteOrder(id: string) { return this.request(`/orders/${id}`, { method: 'DELETE' }); }

  async getDues() { return this.request<any[]>('/dues'); }
  async saveDue(due: any) {
    return this.request<any>(`/dues${due.id ? `/${due.id}` : ''}`, {
      method: due.id ? 'PUT' : 'POST',
      body: JSON.stringify(due)
    });
  }
  async deleteDue(id: string) { return this.request(`/dues/${id}`, { method: 'DELETE' }); }

  // --- PROMOTIONS ---
  async getCoupons() { return this.request<any[]>('/coupons'); }
  async saveCoupon(c: any) {
    return this.request<any>(`/coupons${c.id ? `/${c.id}` : ''}`, {
      method: c.id ? 'PUT' : 'POST',
      body: JSON.stringify(c)
    });
  }
  async deleteCoupon(id: string) { return this.request(`/coupons/${id}`, { method: 'DELETE' }); }

  async getGiftCards() { return this.request<any[]>('/gift-cards'); }
  async saveGiftCard(gc: any) {
    return this.request<any>(`/gift-cards${gc.id ? `/${gc.id}` : ''}`, {
      method: gc.id ? 'PUT' : 'POST',
      body: JSON.stringify(gc)
    });
  }

  // --- CONFIG ---
  async getConfig() { return this.request<any>('/config'); }
  async updateConfig(config: any) {
    return this.request<any>('/config', { method: 'PUT', body: JSON.stringify(config) });
  }

  // --- MARKETING ---
  async getBanners() { return this.request<any[]>('/banners'); }
  async saveBanner(b: any) {
    return this.request<any>(`/banners${b.id ? `/${b.id}` : ''}`, {
      method: b.id ? 'PUT' : 'POST',
      body: JSON.stringify(b)
    });
  }
  async deleteBanner(id: string) { return this.request(`/banners/${id}`, { method: 'DELETE' }); }

  async getNotices() { return this.request<any[]>('/notices'); }
  async saveNotice(n: any) {
    return this.request<any>(`/notices${n.id ? `/${n.id}` : ''}`, {
      method: n.id ? 'PUT' : 'POST',
      body: JSON.stringify(n)
    });
  }
  async deleteNotice(id: string) { return this.request(`/notices/${id}`, { method: 'DELETE' }); }

  async getOffers() { return this.request<any[]>('/offers'); }
  async saveOffer(o: any) {
    return this.request<any>(`/offers${o.id ? `/${o.id}` : ''}`, {
      method: o.id ? 'PUT' : 'POST',
      body: JSON.stringify(o)
    });
  }
  async deleteOffer(id: string) { return this.request(`/offers/${id}`, { method: 'DELETE' }); }

  async getBespokeServices() { return this.request<any[]>('/bespoke-services'); }
  async saveBespokeService(s: any) {
    return this.request<any>(`/bespoke-services${s.id ? `/${s.id}` : ''}`, {
      method: s.id ? 'PUT' : 'POST',
      body: JSON.stringify(s)
    });
  }
  async deleteBespokeService(id: string) { return this.request(`/bespoke-services/${id}`, { method: 'DELETE' }); }

  async getPartners() { return this.request<any[]>('/partners'); }
  async savePartner(p: any) {
    return this.request<any>(`/partners${p.id ? `/${p.id}` : ''}`, {
      method: p.id ? 'PUT' : 'POST',
      body: JSON.stringify(p)
    });
  }
  
  // --- OPERATIONS ---
  async getMaterialRequests() { return this.request<any[]>('/material-requests'); }
  async saveMaterialRequest(r: any) {
    return this.request<any>(`/material-requests${r.id ? `/${r.id}` : ''}`, {
      method: r.id ? 'PUT' : 'POST',
      body: JSON.stringify(r)
    });
  }

  async getProductRequests() { return this.request<any[]>('/product-requests'); }
  async saveProductRequest(r: any) {
    return this.request<any>('/product-requests', { method: 'POST', body: JSON.stringify(r) });
  }

  async getReviews() { return this.request<any[]>('/reviews'); }
  async saveReview(r: any) {
    return this.request<any>(`/reviews${r.id ? `/${r.id}` : ''}`, {
      method: r.id ? 'PUT' : 'POST',
      body: JSON.stringify(r)
    });
  }
  async deleteReview(id: string) { return this.request(`/reviews/${id}`, { method: 'DELETE' }); }
}

export const dbService = new DatabaseService();
