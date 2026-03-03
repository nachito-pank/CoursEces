import { useEffect } from "react";
import { motion } from "framer-motion";
import AOS from "aos";
import "aos/dist/aos.css";
import { BookOpen, Users, Award, TrendingUp } from "lucide-react";
import { Link } from "../components/Link";

export function Home() {
  useEffect(() => {
    AOS.init({ duration: 600, once: true });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Section d'accueil avec image et texte */}
      <section className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-30 lg:gap-25 items-center">
        <div>
          <motion.h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Bienvenue à l'École Communautaire de l'Enseignement Supérieur!
          </motion.h1>

          <motion.p
            className="text-lg sm:text-xl text-slate-600 leading-relaxed mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Une institution engagée à offrir une éducation de qualité, alliant innovation,
            discipline et réussite. Grâce à notre plateforme <b>CoursECES</b>, l’accès aux
            cours devient simple, rapide et numérique.
          </motion.p>


        </div>

        {/* Image d'accueil */}
        <motion.div
          className="w-full max-w-md mx-auto lg:mx-0 float-animation"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="led-border aspect-square">
            <img
              src="https://github.com/nachito-pank/cours-eces/blob/main/eces%20logo.jpg?raw=true"
              alt="École de l'Excellence"
              className="object-cover w-full h-full"
            />
          </div>
        </motion.div>
      </section>

      {/* Section statistiques */}
      <section
        data-aos="fade-up"
        className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {[
          { icon: BookOpen, color: "blue", label: "Cours disponibles", value: "500+" },
          { icon: Users, color: "green", label: "Enseignants qualifiés", value: "50+" },
          { icon: Award, color: "orange", label: "Filières d'études", value: "15" },
          { icon: TrendingUp, color: "red", label: "Taux de réussite", value: "95%" },
        ].map(({ icon: Icon, color, label, value }, i) => (
          <motion.div
            data-aos="flip-left"
            key={i}
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className={`flex items-center justify-center w-14 h-14 bg-${color}-100 rounded-lg mb-4`}>
              <Icon className={`w-7 h-7 text-${color}-600`} />
            </div>
            <h3 className="text-3xl font-bold text-slate-900 mb-2">{value}</h3>
            <p className="text-slate-600">{label}</p>
          </motion.div>
        ))}
      </section>

      {/* Section mission avec image à droite */}
      <section className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <motion.div
          className="order-2 lg:order-1"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6">
            Notre Mission
          </h2>
          <p className="text-lg text-slate-700 leading-relaxed mb-6">
            Former des esprits brillants et responsables grâce à une éducation moderne,
            accessible et tournée vers l’avenir. Notre plateforme <b>CoursECES</b> permet
            aux étudiants d’accéder à leurs cours depuis n’importe quel appareil, sans clé
            USB, sans perte de fichiers.
          </p>
          <p className="text-lg text-slate-700 leading-relaxed">
            Les enseignants disposent d’un espace personnel sécurisé pour gérer leurs
            cours (ajout, modification, suppression), tandis que les étudiants peuvent
            télécharger facilement leurs supports en PDF, Word, Excel ou PowerPoint.
          </p>
        </motion.div>


        {/* Image illustrant la mission */}
        <motion.div
          className="order-1 lg:order-2 w-full h-[400px] rounded-2xl overflow-hidden shadow-2xl"
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <img
            src="https://i.pinimg.com/736x/a6/d9/e3/a6d9e3d0b90c632037852bc9a3898403.jpg" // Pinterest lien corrigé
            alt="Étudiants en apprentissage"
            className="object-cover w-full h-full bg-black"
          />
        </motion.div>

      </section>
      <div className="flex justify-center mt-12">
        <Link
          to="/courses"
          className="inline-flex items-center px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-xl hover:border-[3px] border-blue-900 hover:bg-white hover:text-blue-900 transition-colors shadow-lg hover:shadow-xl"
        >
          <BookOpen className="w-6 h-6 mr-3" />
          Voir les cours
        </Link>
      </div>


      {/* Section valeurs ajoutées */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <motion.h2
          data-aos="fade-up"
          className="text-3xl sm:text-4xl font-bold text-slate-900 mb-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Pourquoi choisir CoursECES ?
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            {
              title: "Accessibilité Totale",
              desc: "Accédez à vos cours 24h/24 depuis votre smartphone, tablette ou ordinateur.",
              img: "https://i.pinimg.com/736x/65/4f/b8/654fb8040d09e32a5034ac5be39602df.jpg",
            },
            {
              title: "Simplicité d’utilisation",
              desc: "Une interface intuitive qui facilite la gestion des cours pour les enseignants et les étudiants.",
              img: "https://i.pinimg.com/736x/b0/e1/c6/b0e1c6e775fd3e780db6b76419bb9662.jpg",
            },
            {
              title: "Partage sécurisé",
              desc: "Fini les clés USB perdues — vos cours sont toujours disponibles et protégés en ligne.",
              img: "https://i.pinimg.com/1200x/95/77/49/957749a7ac04ab3ddf456e36ee88de48.jpg",
            },
          ].map(({ title, desc, img }, i) => (
            <motion.div
              data-aos="zoom-in"
              key={i}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <img src={img} alt={title} className="w-full h-56 object-cover" />
              <div className="p-6">
                <h3 className="text-2xl font-semibold text-slate-900 mb-3">{title}</h3>
                <p className="text-slate-700">{desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

      </section>

    </div>
  );
}
