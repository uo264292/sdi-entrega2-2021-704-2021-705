package com.uniovi.tests;

//Paquetes Java
import java.util.List;
import java.util.Random;

//Paquetes JUnit 
import org.junit.*;
import org.junit.runners.MethodSorters;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;
//Paquetes Selenium 
import org.openqa.selenium.*;
import org.openqa.selenium.firefox.*;
//Paquetes Utilidades de Testing Propias
import com.uniovi.tests.util.SeleniumUtils;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.Filters;
//Paquetes con los Page Object
import com.uniovi.tests.pageobjects.*;

//Ordenamos las pruebas por el nombre del mÃ©todo
@FixMethodOrder(MethodSorters.NAME_ASCENDING)
public class SdiEntrega2Tests {
	// En Windows (Debe ser la versiÃ³n 65.0.1 y desactivar las actualizacioens
	// automÃ¡ticas)):
	static String PathFirefox65 = "C:\\Program Files\\Mozilla Firefox\\firefox.exe";
	static String Geckdriver024 = "C:\\geckodriver024win64.exe";
	// ComÃºn a Windows y a MACOSX
	static WebDriver driver = getDriver(PathFirefox65, Geckdriver024);
	static String URL = "https://localhost:8081";

	public static WebDriver getDriver(String PathFirefox, String Geckdriver) {
		System.setProperty("webdriver.firefox.bin", PathFirefox);
		System.setProperty("webdriver.gecko.driver", Geckdriver);
		WebDriver driver = new FirefoxDriver();
		return driver;
	}

	@Before
	public void setUp() {

		MongoClient mongoClient = MongoClients.create(
				"mongodb+srv://admin:<password>@wallapop.emuii.mongodb.net/myFirstDatabase?retryWrites=true&w=majority");
		MongoDatabase database = mongoClient.getDatabase("test");

		database.getCollection("ofertas").drop();
		PO_PrivateView.signup(driver, "candela@gmail.com", "Candela", "Bobes", "12345", "12345");
		PO_PrivateView.logout(driver);
		PO_PrivateView.signup(driver, "sergio@gmail.com", "Sergio", "Cimadevilla", "12345", "12345");
		PO_PrivateView.logout(driver);
		driver.navigate().to(URL);
	}

	@After
	public void tearDown() {
		driver.manage().deleteAllCookies();
	}

	@BeforeClass
	static public void begin() {
		// COnfiguramos las pruebas.
		// Fijamos el timeout en cada opciÃ³n de carga de una vista. 2 segundos.
		PO_View.setTimeout(3);

	}

	@AfterClass
	static public void end() {
		// Cerramos el navegador al finalizar las pruebas
		driver.quit();
	}

	// PR01. Registro de usuario con datos validos/
	@Test
	public void PR01() {
		String email = "candela" + Math.random() * 6 + "@gmail.com";
		PO_PrivateView.signup(driver, email, "Candela", "Bobes", "12345", "12345");
		assertNotNull(PO_View.checkElement(driver, "text", "Lista De Ofertas Destacadas"));
		PO_PrivateView.logout(driver);
		PO_View.checkElement(driver, "text", "Identificación de usuario");

	}

	// PR02. Registro de Usuario con datos inválidos (email, nombre y apellidos
	// vacíos)./
	@Test
	public void PR02() {
		PO_PrivateView.signup(driver, "", "", "", "12345", "12345");
		assertNotNull(PO_View.checkElement(driver, "id", "signup"));
	}

	// PR03. Registro de Usuario con datos inválidos (repetición de contraseña
	// inválida) /
	@Test
	public void PR03() {
		PO_PrivateView.signup(driver, "candelabj00@gmail.com", "Candela", "Bobes", "12345", "12345865736");
		assertNotNull(PO_View.checkElement(driver, "id", "signup"));
		assertNotNull(PO_View.checkElement(driver, "text", "La contraseña no coincide"));
	}

	// PR04. Registro de Usuario con datos inválidos (email existente). /
	@Test
	public void PR04() {
		PO_PrivateView.signup(driver, "candela@gmail.com", "Candela", "Bobes", "12345", "12345");
		assertNotNull(PO_View.checkElement(driver, "id", "signup"));
		assertNotNull(PO_View.checkElement(driver, "text", "Ya existe un usuario con ese email."));
	}

	// PR05. Inicio de sesión con datos válidos. /
	@Test
	public void PR05() {
		PO_PrivateView.login(driver, "candela@gmail.com", "12345");
		assertNotNull(PO_View.checkElement(driver, "text", "Lista De Ofertas Destacadas"));
		PO_PrivateView.logout(driver);
		PO_View.checkElement(driver, "text", "Identificación de usuario");
	}

	// PR06. Inicio de sesión con datos inválidos (email existente, pero contraseña
	// incorrecta). /
	@Test
	public void PR06() {
		PO_PrivateView.login(driver, "candela@gmail.com", "falsa");
		assertNotNull(PO_View.checkElement(driver, "text", "Email o password incorrecto"));
	}

	// PR07. Inicio de sesión con datos inválidos (campo email o contraseña vacíos).
	// /
	@Test
	public void PR07() {
		// Sin contraseña
		PO_PrivateView.login(driver, "candela@gmail.com", "");
		assertNotNull(PO_View.checkElement(driver, "id", "IdentificacionTitle"));
		SeleniumUtils.textoNoPresentePagina(driver, "Email: ");
		// Sin email
		PO_PrivateView.login(driver, "", "12345");
		assertNotNull(PO_View.checkElement(driver, "id", "IdentificacionTitle"));
		SeleniumUtils.textoNoPresentePagina(driver, "Email: ");
	}

	// PR08. Inicio de sesión con datos inválidos (email no existente en la
	// aplicación) /
	@Test
	public void PR08() {
		PO_PrivateView.login(driver, "alguien@gmail.com", "falsa");
		assertNotNull(PO_View.checkElement(driver, "text", "Email o password incorrecto"));
		assertNotNull(PO_View.checkElement(driver, "id", "IdentificacionTitle"));
		SeleniumUtils.textoNoPresentePagina(driver, "Email: ");
	}

	// PR09. Hacer click en la opción de salir de sesión y comprobar que se redirige
	// a la página de inicio de sesión (Login) /
	@Test
	public void PR09() {
		PO_PrivateView.login(driver, "candela@gmail.com", "12345");
		assertNotNull(PO_View.checkElement(driver, "text", "Lista De Ofertas Destacadas"));
		PO_PrivateView.logout(driver);
		PO_View.checkElement(driver, "id", "IdentificacionTitle");
		SeleniumUtils.textoNoPresentePagina(driver, "Dinero:");
	}

	// PR10. Comprobar que el botón cerrar sesión no está visible si el usuario no
	// está autenticado /
	@Test
	public void PR10() {
		SeleniumUtils.textoNoPresentePagina(driver, "Desconectarse");
	}

	// PR11. Mostrar el listado de usuarios y comprobar que se muestran todos los
	// que existen en el sistema. /
	@Test
	public void PR11() {

		PO_PrivateView.login(driver, "admin@admin.com", "admin");
		driver.navigate().to("https://localhost:8081/usuarios");

		assertNotNull(PO_View.checkElement(driver, "text", "candela@gmail.com"));
		assertNotNull(PO_View.checkElement(driver, "text", "sergio@gmail.com"));
		assertNotNull(PO_View.checkElement(driver, "text", "admin@admin.com"));

	}

	// PR12. Ir a la lista de usuarios, borrar el primer usuario de la lista,
	// comprobar que la lista se
	// actualiza y dicho usuario desaparece. /
	@Test
	public void PR12() {

		PO_PrivateView.login(driver, "admin@admin.com", "admin");

		String firstUser = PO_ListUsersView.getUser1(driver);

		PO_ListUsersView.deleteUser1(driver);

		assertTrue(PO_ListUsersView.getUser1(driver) != firstUser);
		PO_PrivateView.logout(driver);

		PO_PrivateView.signup(driver, "candela@gmail.com", "Candela", "Bobes", "12345", "12345");
		if (SeleniumUtils.textoEnPagina(driver, "Desconectar")) {
			PO_PrivateView.logout(driver);
			PO_PrivateView.signup(driver, "sergio@gmail.com", "Sergio", "Cimadevilla", "12345", "12345");
			if (SeleniumUtils.textoEnPagina(driver, "Desconectar")) {
				PO_PrivateView.logout(driver);
			}
		} else {
			PO_PrivateView.signup(driver, "sergio@gmail.com", "Sergio", "Cimadevilla", "12345", "12345");
			if (SeleniumUtils.textoEnPagina(driver, "Desconectar")) {
				PO_PrivateView.logout(driver);
			}
		}

	}

	// PR13. Ir a la lista de usuarios, borrar el último usuario de la lista,
	// comprobar que la lista se
	// actualiza y dicho usuario desaparece. /
	@Test
	public void PR13() {
		String email = "test13" + Math.random() * 2 + "@gmail.com";
		PO_PrivateView.signup(driver, email, "Test", "Test", "12345", "12345");
		PO_PrivateView.logout(driver);

		PO_PrivateView.login(driver, "admin@admin.com", "admin");

		PO_ListUsersView.deleteLastUser(driver);
		SeleniumUtils.textoNoPresentePagina(driver, email);

		PO_PrivateView.logout(driver);
		PO_PrivateView.signup(driver, "candela@gmail.com", "Candela", "Bobes", "12345", "12345");
		if (SeleniumUtils.textoEnPagina(driver, "Desconectar")) {
			PO_PrivateView.logout(driver);
			PO_PrivateView.signup(driver, "sergio@gmail.com", "Sergio", "Cimadevilla", "12345", "12345");
			if (SeleniumUtils.textoEnPagina(driver, "Desconectar")) {
				PO_PrivateView.logout(driver);
			}
		} else {
			PO_PrivateView.signup(driver, "sergio@gmail.com", "Sergio", "Cimadevilla", "12345", "12345");
			if (SeleniumUtils.textoEnPagina(driver, "Desconectar")) {
				PO_PrivateView.logout(driver);
			}
		}
	}

	// PR14. Ir a la lista de usuarios, borrar 3 usuarios, comprobar que la lista se
	// actualiza y dichos
	// usuarios desaparecen /
	@Test
	public void PR14() {
		String email = "test14" + Math.random() * 2 + "@gmail.com";
		String email2 = "test14" + Math.random() * 2 + "@gmail.com";
		String email3 = "test14" + Math.random() * 2 + "@gmail.com";
		PO_PrivateView.signup(driver, email, "Test1", "test", "12345", "12345");
		PO_PrivateView.logout(driver);
		PO_PrivateView.signup(driver, email2, "Test2", "test", "12345", "12345");
		PO_PrivateView.logout(driver);
		PO_PrivateView.signup(driver, email3, "Test3", "test", "12345", "12345");
		PO_PrivateView.logout(driver);

		PO_PrivateView.login(driver, "admin@admin.com", "admin");
		PO_ListUsersView.delete3LastUsers(driver);

		SeleniumUtils.textoNoPresentePagina(driver, email);
		SeleniumUtils.textoNoPresentePagina(driver, email2);
		SeleniumUtils.textoNoPresentePagina(driver, email3);

		PO_PrivateView.logout(driver);
	}

	// PR15. Ir al formulario de alta de oferta, rellenarla con datos válidos y
	// pulsar el botón Submit.
	// Comprobar que la oferta sale en el listado de ofertas de dicho usuario /
	@Test
	public void PR15() {
		PO_PrivateView.login(driver, "admin@admin.com", "admin");
		PO_OffersView.addOffer(driver, "cama", "para la habitacion", 204.0, false);
		assertNotNull(PO_View.checkElement(driver, "text", "cama"));
		assertNotNull(PO_View.checkElement(driver, "text", "para la habitacion"));

		PO_PrivateView.logout(driver);
	}

	// PR16. Ir al formulario de alta de oferta, rellenarla con datos inválidos
	// (campo título vacío y
	// precio en negativo) y pulsar el botón Submit. Comprobar que se muestra el
	// mensaje de campo
	// obligatorio./
	@Test
	public void PR16() {
		PO_PrivateView.login(driver, "admin@admin.com", "admin");
		PO_OffersView.addOffer(driver, "", "Para el baño", 100, false);
		assertNotNull(PO_View.checkElement(driver, "id", "mOfertasAgregar"));
		PO_OffersView.addOffer(driver, "silla", "de bebe", -7, false);
		assertNotNull(PO_View.checkElement(driver, "text", "Titulo, detalles o precio no validos"));
		PO_PrivateView.logout(driver);
	}

	// PR017. Mostrar el listado de ofertas para dicho usuario y comprobar que se
	// muestran todas las
	// que existen para este usuario. /
	@Test
	public void PR17() {
		String email = "candela17" + Math.random() * 2 + "@gmail.com";

		PO_PrivateView.signup(driver, email, "Candela", "Bobes", "12345", "12345");

		PO_OffersView.addOffer(driver, "Reloj", "Para la cocina", 10, false);
		PO_OffersView.addOffer(driver, "Manta", "Para la habitación", 15, false);
		PO_OffersView.addOffer(driver, "Mesita", "Para el baño", 7, false);
		driver.navigate().to("https://localhost:8081/ofertas/propias");

		SeleniumUtils.textoPresentePagina(driver, "reloj");
		SeleniumUtils.textoPresentePagina(driver, "manta");
		SeleniumUtils.textoPresentePagina(driver, "mesita");

		PO_PrivateView.logout(driver);
	}

	// PR18. Ir a la lista de ofertas, borrar la primera oferta de la lista,
	// comprobar que la lista se
	// actualiza y que la oferta desaparece. /
	@Test
	public void PR18() {
		String email = "candela18" + Math.random() * 2 + "@gmail.com";

		PO_PrivateView.signup(driver, email, "Candela", "Bobes", "12345", "12345");

		PO_OffersView.addOffer(driver, "Reloj", "Para la cocina", 10, false);
		PO_OffersView.addOffer(driver, "Manta", "Para la habitación", 15, false);
		PO_OffersView.addOffer(driver, "Mesita", "Para el baño", 7, false);
		driver.navigate().to("https://localhost:8081/ofertas/propias");
		PO_OffersView.deleteOffer1(driver);
		SeleniumUtils.textoNoPresentePagina(driver, "reloj");

	}

	// PR19. Ir a la lista de ofertas, borrar la última oferta de la lista,
	// comprobar que la lista se actualiza
	// y que la oferta desaparece. /
	@Test
	public void PR19() {
		String email = "candela19" + Math.random() * 2 + "@gmail.com";

		PO_PrivateView.signup(driver, email, "Candela", "Bobes", "12345", "12345");

		PO_OffersView.addOffer(driver, "Reloj", "Para la cocina", 10, false);
		PO_OffersView.addOffer(driver, "Manta", "Para la habitación", 15, false);
		PO_OffersView.addOffer(driver, "Mesita", "Para el baño", 7, false);
		driver.navigate().to("https://localhost:8081/ofertas/propias");
		PO_OffersView.deleteLastOffer(driver);
		SeleniumUtils.textoNoPresentePagina(driver, "mesita");
	}

	// P20. Hacer una búsqueda con el campo vacío y comprobar que se muestra la
	// página que
	// corresponde con el listado de las ofertas existentes en el sistema /
	@Test
	public void PR20() {
		String email = "candela20" + Math.random() * 2 + "@gmail.com";

		PO_PrivateView.signup(driver, email, "Candela", "Bobes", "12345", "12345");

		PO_OffersView.addOffer(driver, "Reloj", "Para la cocina", 10, false);
		PO_OffersView.addOffer(driver, "Manta", "Para la habitación", 15, false);
		PO_OffersView.addOffer(driver, "Mesita", "Para el baño", 7, false);
		driver.navigate().to("https://localhost:8081/ofertas");
		PO_OffersView.searchOfferByName(driver, "");
		assertNotNull(PO_View.checkElement(driver, "text", "reloj"));
		assertNotNull(PO_View.checkElement(driver, "text", "manta"));
		assertNotNull(PO_View.checkElement(driver, "text", "mesita"));

		PO_PrivateView.logout(driver);
	}

	// PR21. Hacer una búsqueda escribiendo en el campo un texto que no exista y
	// comprobar que se
	// muestra la página que corresponde, con la lista de ofertas vacía. /
	@Test
	public void PR21() {
		String email = "candela21" + Math.random() * 2 + "@gmail.com";

		PO_PrivateView.signup(driver, email, "Candela", "Bobes", "12345", "12345");
		driver.navigate().to("https://localhost:8081/ofertas");
		PO_OffersView.searchOfferByName(driver, "inexistente");
		SeleniumUtils.textoNoPresentePagina(driver, "inexistente");

		PO_PrivateView.logout(driver);
	}

	// PR22. Hacer una búsqueda escribiendo en el campo un texto en minúscula o
	// mayúscula y
	// comprobar que se muestra la página que corresponde, con la lista de ofertas
	// que contengan
	// dicho texto, independientemente que el título esté almacenado en minúsculas o
	// mayúscula /
	@Test
	public void PR22() {
		String email = "candela22" + Math.random() * 2 + "@gmail.com";

		PO_PrivateView.signup(driver, email, "Candela", "Bobes", "12345", "12345");
		PO_OffersView.addOffer(driver, "ROSA", "CAMILLA", 50.0, false);

		PO_OffersView.searchOfferByName(driver, "ros");
		assertNotNull(PO_View.checkElement(driver, "text", "rosa"));

		PO_PrivateView.logout(driver);
	}

	// PR23. Sobre una búsqueda determinada (a elección de desarrollador), comprar
	// una oferta que
	// deja un saldo positivo en el contador del comprobador. Y comprobar que el
	// contador se
	// actualiza correctamente en la vista del comprador. /
	@Test
	public void PR23() {
		String email = "candela23" + Math.random() * 2 + "@gmail.com";
		String compra = "micro" + Math.random() * 2;
		PO_PrivateView.signup(driver, email, "Candela", "Bobes", "12345", "12345");
		PO_OffersView.addOffer(driver, compra, "Microondas", 20.0, false);
		PO_PrivateView.logout(driver);
		String email2 = "candela23" + Math.random() * 2 + "@gmail.com";

		PO_PrivateView.signup(driver, email2, "Candela", "Bobes", "12345", "12345");

		PO_OffersView.buyOfferByName(driver, compra);

		assertEquals(80, Integer.parseInt(PO_PrivateView.dinero(driver)));

		PO_PrivateView.logout(driver);
	}

	// PR24. Sobre una búsqueda determinada (a elección de desarrollador), comprar
	// una oferta que
	// deja un saldo 0 en el contador del comprobador. Y comprobar que el contador
	// se actualiza
	// correctamente en la vista del comprador.

	@Test
	public void PR24() {
		String email = "candela24" + Math.random() * 2 + "@gmail.com";
		String compra = "camara" + Math.random() * 2;
		PO_PrivateView.signup(driver, email, "Candela", "Bobes", "12345", "12345");
		PO_OffersView.addOffer(driver, compra, "camara", 100.0, false);
		PO_PrivateView.logout(driver);
		String email2 = "candela24" + Math.random() * 2 + "@gmail.com";

		PO_PrivateView.signup(driver, email2, "Candela", "Bobes", "12345", "12345");

		PO_OffersView.buyOfferByName(driver, compra);

		assertEquals(0, Integer.parseInt(PO_PrivateView.dinero(driver)));

		PO_PrivateView.logout(driver);
	}

	// PR25. Sobre una búsqueda determinada (a elección de desarrollador), intentar
	// comprar una
	// oferta que esté por encima de saldo disponible del comprador. Y comprobar que
	// se muestra el
	// mensaje de saldo no suficiente. /
	@Test
	public void PR25() {
		String email = "candela25" + Math.random() * 2 + "@gmail.com";
		String compra = "micro" + Math.random() * 2;
		PO_PrivateView.signup(driver, email, "Candela", "Bobes", "12345", "12345");
		PO_OffersView.addOffer(driver, compra, "Microondas", 110.0, false);
		PO_PrivateView.logout(driver);
		String email2 = "candela24" + Math.random() * 2 + "@gmail.com";

		PO_PrivateView.signup(driver, email2, "Candela", "Bobes", "12345", "12345");

		PO_OffersView.buyOfferByName(driver, compra);

		assertEquals(100, Integer.parseInt(PO_PrivateView.dinero(driver)));
		assertNotNull(PO_View.checkElement(driver, "text", "Dinero insuficiente"));
		PO_PrivateView.logout(driver);
	}

	// PR26. Ir a la opción de ofertas compradas del usuario y mostrar la lista.
	// Comprobar que
	// aparecen las ofertas que deben aparecer. /
	@Test
	public void PR26() {
		String email = "candela26" + Math.random() * 2 + "@gmail.com";
		String compra = "micro" + Math.random() * 2;
		String compra2 = "micro" + Math.random() * 2;
		PO_PrivateView.signup(driver, email, "Candela", "Bobes", "12345", "12345");
		PO_OffersView.addOffer(driver, compra, "Microondas", 110.0, false);
		PO_OffersView.addOffer(driver, compra2, "Microondas", 110.0, false);
		assertNotNull(PO_View.checkElement(driver, "text", compra));
		assertNotNull(PO_View.checkElement(driver, "text", compra2));
	}

	// PR27. Al crear una oferta marcar dicha oferta como destacada y a continuación
	// comprobar: i)
	// que aparece en el listado de ofertas destacadas para los usuarios y que el
	// saldo del usuario se
	// actualiza adecuadamente en la vista del ofertante (-20).
	@Test
	public void PR27() {
		String email = "candela27" + Math.random() * 2 + "@gmail.com";
		String compra = "micro" + Math.random() * 2;
		PO_PrivateView.signup(driver, email, "Candela", "Bobes", "12345", "12345");
		PO_OffersView.addOffer(driver, compra, "Microondas", 15.0, true);
		driver.navigate().to("https://localhost:8081/ofertas/destacadas");
		assertNotNull(PO_View.checkElement(driver, "text", compra));
		assertEquals(80, Integer.parseInt(PO_PrivateView.dinero(driver)));
	}

	// PR028. Sobre el listado de ofertas de un usuario con más de 20 euros de
	// saldo, pinchar en el
	// enlace Destacada y a continuación comprobar: i) que aparece en el listado de
	// ofertas destacadas
	// para los usuarios y que el saldo del usuario se actualiza adecuadamente en la
	// vista del ofertante (-
	// 20). /
	@Test
	public void PR28() {
		String email = "candela28" + Math.random() * 2 + "@gmail.com";
		String compra = "reloj" + Math.random() * 2;
		PO_PrivateView.signup(driver, email, "Candela", "Bobes", "12345", "12345");
		PO_OffersView.addOffer(driver, compra, "de madera", 14.0, false);
		driver.navigate().to("https://localhost:8081/ofertas/propias");
		PO_OffersView.destacar(driver);

		driver.navigate().to("https://localhost:8081/ofertas/destacadas");

		assertNotNull(PO_View.checkElement(driver, "text", compra));
		assertEquals(80, Integer.parseInt(PO_PrivateView.dinero(driver)));

		PO_PrivateView.logout(driver);
	}

	// PR029. Sobre el listado de ofertas de un usuario con menos de 20 euros de
	// saldo, pinchar en el
	// enlace Destacada y a continuación comprobar que se muestra el mensaje de
	// saldo no suficiente. /
	@Test
	public void PR29() {
		String email = "candela29" + Math.random() * 2 + "@gmail.com";
		String email2 = "sergio29" + Math.random() * 2 + "@gmail.com";
		String compra = "reloj" + Math.random() * 2;
		String compra2 = "casco" + Math.random() * 2;
		PO_PrivateView.signup(driver, email, "Candela", "Bobes", "12345", "12345");
		PO_OffersView.addOffer(driver, compra, "de madera", 85.0, false);
		PO_PrivateView.logout(driver);
		PO_PrivateView.signup(driver, email2, "Sergio", "Cimadevilla", "12345", "12345");
		PO_OffersView.buyOfferByName2(driver, compra);
		PO_OffersView.addOffer(driver, compra2, "de madera", 20.0, false);
		driver.navigate().to("https://localhost:8081/ofertas/propias");
		PO_OffersView.destacar2(driver);

		assertNotNull(PO_View.checkElement(driver, "text", "No dispone de saldo suficiente."));
		assertEquals(15, Integer.parseInt(PO_PrivateView.dinero(driver)));

		PO_PrivateView.logout(driver);
	}

	// PR030. Sin hacer /
	@Test
	public void PR30() {
		assertTrue("PR30 sin hacer", false);
	}

	// PR031. Sin hacer /
	@Test
	public void PR31() {
		assertTrue("PR31 sin hacer", false);
	}

}
