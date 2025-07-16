

const Contact = () => {
  return (
    <div className="min-h-screen bg-[#F5F5F5]">
     

      {/* Content */}
      <div className="max-w-4xl mx-auto py-16 px-4">
        <h1 className="font-serif text-[55px] font-semibold text-black mb-8">
          Contact Us
        </h1>
        <div className="space-y-6 text-lg text-black">
          <p>
            Have a restaurant recommendation or want to get featured on Eugene
            Eats? We'd love to hear from you!
          </p>
          <div className="bg-white p-8 rounded-[20px] shadow-lg">
            <h2 className="font-serif text-[30px] font-semibold mb-4">
              Get in Touch
            </h2>
            <div className="space-y-4">
              <p>
                <strong>Email:</strong> hello@eugeneeats.com
              </p>
              <p>
                <strong>Phone:</strong> (541) 555-EATS
              </p>
              <p>
                <strong>Address:</strong> Eugene, Oregon
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
