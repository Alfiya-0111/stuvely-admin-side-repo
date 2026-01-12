import { Link } from "react-router";

function Sidebar() {
  return (
    <div className="w-64 bg-gray-900 text-white p-4 overflow-auto">
      <h2 className="text-xl font-bold mb-6">Admin Panel</h2>
      <ul className="space-y-4">
        <li><Link to="/admin">Dashboard</Link></li>
        <li><Link to="/admin/users">NavLiNKs</Link></li>
        <li><Link to="/admin/imgurl">ImgUrl</Link></li>
        <li><Link to="/admin/ourcollection">OurCollection</Link></li>
           <li><Link to="/admin/offerslider">OfferSlider</Link></li>
            <li><Link to="/admin/bestdeals">Bestdeals</Link></li>
            <li><Link to="/admin/cars">Cars</Link></li>
             <li><Link to="/admin/keychains">Keychains</Link></li>
                 <li><Link to="/admin/order">Order</Link></li>
                <li><Link to="/admin/reviews">Reviews</Link></li> 
               <li><Link to="/admin/adminfooter">Footerediting</Link></li>
            
       
      </ul>
    </div>
  );
}

export default Sidebar;
