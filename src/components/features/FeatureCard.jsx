function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-white dark:bg-primary-grey rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
      <div className="w-12 h-12 bg-primary-red rounded-full flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-primary-grey dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-primary-grey dark:text-gray-300">{description}</p>
    </div>
  );
}

export default FeatureCard;
