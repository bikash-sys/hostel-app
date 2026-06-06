import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'https://cywccfxglanhketofhyw.supabase.co';
const supabaseAnonKey = 'sb_publishable_Bvk4aCHwE4V_LAaauYbEcg_OpxMh973';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    storageKey: 'dormdesk-mobile-auth-token',
  },
});

// ─── Profiles ────────────────────────────────────────────────────────────────
export async function getProfile(email) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .maybeSingle();
    if (error) throw error;
    return data;
  } catch (e) {
    console.error('getProfile error:', e);
    return null;
  }
}

export async function saveProfile(email, role, status = 'approved') {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({ email, role, status }, { onConflict: 'email' })
      .select();
    if (error) throw error;
    return data?.[0] || null;
  } catch (e) {
    console.error('saveProfile error:', e);
    return null;
  }
}

// ─── Laundry Requests ────────────────────────────────────────────────────────
export async function getLaundryRequests() {
  try {
    const { data, error } = await supabase
      .from('laundry_requests')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (e) {
    console.error('getLaundryRequests error:', e);
    return [];
  }
}

export async function addLaundryRequest({ user_email, room_name, type }) {
  try {
    const { data, error } = await supabase
      .from('laundry_requests')
      .insert([{ user_email, room_name, type, status: 'pending' }])
      .select();
    if (error) throw error;
    return data?.[0] || null;
  } catch (e) {
    console.error('addLaundryRequest error:', e);
    return null;
  }
}

export async function updateLaundryRequestStatus(id, status) {
  try {
    const { data, error } = await supabase
      .from('laundry_requests')
      .update({ status })
      .eq('id', id)
      .select();
    if (error) throw error;
    return data?.[0] || null;
  } catch (e) {
    console.error('updateLaundryRequestStatus error:', e);
    return null;
  }
}

// ─── Room Services ───────────────────────────────────────────────────────────
export async function getRoomServices() {
  try {
    const { data, error } = await supabase
      .from('room_services')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (e) {
    console.error('getRoomServices error:', e);
    return [];
  }
}

export async function addRoomService({ user_email, room_name, type }) {
  try {
    const { data, error } = await supabase
      .from('room_services')
      .insert([{ user_email, room_name, type, status: 'pending' }])
      .select();
    if (error) throw error;
    return data?.[0] || null;
  } catch (e) {
    console.error('addRoomService error:', e);
    return null;
  }
}

export async function updateRoomServiceStatus(id, status) {
  try {
    const { data, error } = await supabase
      .from('room_services')
      .update({ status })
      .eq('id', id)
      .select();
    if (error) throw error;
    return data?.[0] || null;
  } catch (e) {
    console.error('updateRoomServiceStatus error:', e);
    return null;
  }
}

// ─── Mess Menu ────────────────────────────────────────────────────────────────
const DEFAULT_MENU = [
  { meal: 'Breakfast', time: '7:30 AM – 9:00 AM', items: 'Idli, Dosa, Poha, Bread & Eggs, Tea/Coffee' },
  { meal: 'Lunch', time: '12:30 PM – 2:00 PM', items: 'Rice, Dal, Sabzi, Roti, Curd, Salad' },
  { meal: 'Snacks', time: '4:30 PM – 5:30 PM', items: 'Samosa, Tea, Biscuits' },
  { meal: 'Dinner', time: '7:30 PM – 9:00 PM', items: 'Rice, Dal, Paneer/Chicken, Roti, Sweet' },
];

export async function getMessMenu() {
  try {
    const { data, error } = await supabase.from('mess_menu').select('*').order('id');
    if (error) throw error;
    if (data?.length > 0) return data;
  } catch (e) {
    console.error('getMessMenu error:', e);
  }
  return DEFAULT_MENU;
}

export async function saveMessMenu(schedule) {
  try {
    const { error } = await supabase.from('mess_menu').upsert(schedule, { onConflict: 'meal' });
    if (error) throw error;
  } catch (e) {
    console.error('saveMessMenu error:', e);
  }
  return schedule;
}

// ─── Bookings ─────────────────────────────────────────────────────────────────
export async function getBookings(email) {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_email', email)
      .order('check_in', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (e) {
    console.error('getBookings error:', e);
    return [];
  }
}

export async function addBooking(booking) {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .insert([booking])
      .select();
    if (error) throw error;
    return data?.[0] || null;
  } catch (e) {
    console.error('addBooking error:', e);
    return null;
  }
}

// ─── EmailJS ──────────────────────────────────────────────────────────────────
export async function sendBookingEmail({ to_email, guest_name, room_name, check_in, booking_id }) {
  try {
    const templateParams = {
      to_email,
      guest_name,
      room_name,
      check_in,
      booking_id,
    };
    const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: 'service_lduq7np',
        template_id: 'template_6w6ox5i',
        user_id: 'WBEyamB5OZk4Fvh55',
        template_params: templateParams,
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      console.error('EmailJS error:', text);
      return false;
    }
    return true;
  } catch (e) {
    console.error('sendBookingEmail error:', e);
    return false;
  }
}

// ─── Complaints ────────────────────────────────────────────────────────────────
export async function addComplaint(complaint) {
  try {
    const { data, error } = await supabase
      .from('complaints')
      .insert([complaint])
      .select();
    if (error) throw error;
    return data?.[0] || null;
  } catch (e) {
    console.error('addComplaint error:', e);
    return null;
  }
}

export async function getComplaints() {
  try {
    const { data, error } = await supabase
      .from('complaints')
      .select('*')
      .order('date', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (e) {
    console.error('getComplaints error:', e);
    return [];
  }
}
