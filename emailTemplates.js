/**
 * MEHEDI ATELIER - LOCALIZED TEMPLATE REGISTRY
 * Supports EN (English) and BN (Bengali)
 */

const getStepBN = (step) => {
    const map = {
        'Queue': 'অপেক্ষমান তালিকা',
        'Cutting': 'কাটিং',
        'Stitching': 'সেলাই',
        'Finishing': 'ফিনিশিং',
        'Ready': 'প্রস্তুত'
    };
    return map[step] || step;
};

export const templates = {
    ORDER_CONFIRMED: {
        subject: {
            en: (data) => `Order Confirmed: #${data.orderId || data.entityId} | Mehedi Tailors`,
            bn: (data) => `অর্ডার নিশ্চিত করা হয়েছে: #${data.orderId || data.entityId} | মেহেদী টেইলার্স`
        },
        body: {
            en: (data) => `
                <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 15px;">
                    <img src="${data.logo}" style="height: 50px; margin-bottom: 20px;" />
                    <h2 style="color: #0f172a;">Salaam, ${data.name}!</h2>
                    <p>We have successfully received your artisan commission <b>#${data.orderId || data.entityId}</b>.</p>
                    <div style="background: #f8fafc; padding: 15px; border-radius: 10px; margin: 20px 0;">
                        <p style="margin: 0;"><b>Total Valuation:</b> BDT ${data.total}</p>
                        <p style="margin: 5px 0 0 0;"><b>Status:</b> Handing over to production queue</p>
                    </div>
                    <p style="color: #64748b; font-size: 12px;">You can track your garment's journey in real-time via <a href="${data.trackingUrl}">our portal</a>.</p>
                </div>
            `,
            bn: (data) => `
                <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 15px;">
                    <img src="${data.logo}" style="height: 50px; margin-bottom: 20px;" />
                    <h2 style="color: #0f172a;">সালাম, ${data.name}!</h2>
                    <p>আমরা সফলভাবে আপনার অর্ডারটি <b>#${data.orderId || data.entityId}</b> গ্রহণ করেছি।</p>
                    <div style="background: #f8fafc; padding: 15px; border-radius: 10px; margin: 20px 0;">
                        <p style="margin: 0;"><b>মোট মূল্য:</b> BDT ${data.total}</p>
                    </div>
                    <p style="color: #64748b; font-size: 12px;">আপনি আমাদের পোর্টালের মাধ্যমে রিয়েল-টাইমে আপনার পোশাক তৈরির অগ্রগতি দেখতে পারেন।</p>
                </div>
            `
        }
    },
    PAYMENT_SUCCESS: {
        subject: {
            en: (data) => `Payment Received - Order #${data.orderId || data.entityId}`,
            bn: (data) => `পেমেন্ট সম্পন্ন হয়েছে - অর্ডার #${data.orderId || data.entityId}`
        },
        body: {
            en: (data) => `
                <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 15px;">
                    <h2 style="color: #10b981;">Fiscal Handshake Verified</h2>
                    <p>A payment of <b>BDT ${data.amount}</b> has been settled for order #${data.orderId || data.entityId}.</p>
                    <p>Gateway Reference: <b>${data.refId || 'N/A'}</b></p>
                    <p><a href="${data.invoiceUrl}">Download Artisan Invoice</a></p>
                </div>
            `,
            bn: (data) => `
                <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px;">
                    <h2 style="color: #10b981;">পেমেন্ট নিশ্চিত করা হয়েছে</h2>
                    <p>আপনার অর্ডার #${data.orderId || data.entityId} এর জন্য <b>BDT ${data.amount}</b> গ্রহণ করা হয়েছে।</p>
                </div>
            `
        }
    },
    PRODUCTION_UPDATE: {
        subject: {
            en: (data) => `Artisan Update: Order #${data.orderId || data.entityId} is now in ${data.step}`,
            bn: (data) => `তৈরির আপডেট: অর্ডার #${data.orderId || data.entityId} এখন ${getStepBN(data.step)} পর্যায়ে আছে`
        },
        body: {
            en: (data) => `
                <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 15px;">
                    <h2 style="color: #0f172a;">Production Update</h2>
                    <p>The artisan team has moved your order <b>#${data.orderId || data.entityId}</b> to the <b>${data.step}</b> phase.</p>
                    <p>View details: <a href="${data.trackingUrl}">Track My Garment</a></p>
                </div>
            `,
            bn: (data) => `
                <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px;">
                    <p>কারিগর দল আপনার অর্ডার #${data.orderId || data.entityId} টি এখন <b>${getStepBN(data.step)}</b> পর্যায়ে শুরু করেছেন।</p>
                </div>
            `
        }
    },
    SECURITY_ALERT: {
        subject: {
            en: (data) => `Account Identity Updated | Mehedi Tailors`,
            bn: (data) => `অ্যাকাউন্ট তথ্য পরিবর্তন করা হয়েছে`
        },
        body: {
            en: (data) => `<p>This is an automated alert to inform you that your profile data for <b>${data.email}</b> was recently modified from an authorized terminal.</p>`,
            bn: (data) => `<p>আপনার অ্যাকাউন্ট <b>${data.email}</b> এর প্রোফাইল তথ্য সম্প্রতি পরিবর্তন করা হয়েছে।</p>`
        }
    }
};